from flask import Flask, render_template, send_file, request
from flask_s3 import FlaskS3
from flask_restful import Api
from api.HelloApiHandler import HelloApiHandler
# import yt_dlp
from pytube import YouTube
import os
from flask_cors import CORS
import boto3
import subprocess

app = Flask(__name__, template_folder='frontend/dist', static_folder='frontend/dist/assets')
CORS(app)
app.config['FLASKS3_BUCKET_NAME'] = 'youtube-cutter-static-files'
s3 = FlaskS3(app)
api = Api(app)

api.add_resource(HelloApiHandler, '/flask/hello')

@app.route('/hello/<name>')
def say_hello(name):
    print(f"hellooo {name}")
    return f'Hello, {name}!'

@app.route('/download/<vid>')
def test_youtube_download(vid):
    s3 = boto3.resource('s3')

    url = "https://www.youtube.com/watch?v=" + vid
    # url input from user
    yt = YouTube(url)
    
    video = yt.streams.filter(only_audio=True).first()
    # output_path="/tmp/"
    out_file = video.download()
    base, ext = os.path.splitext(out_file)
    new_file = base + '.mp3'
    os.rename(out_file, new_file)
    
    print(f"download complete of {new_file}! Now uploading to s3...")

    bucket_name = 'youtube-cutter-static-files'
    file_key = 'audio/temp.mp3'

    s3.meta.client.upload_file(new_file, bucket_name, file_key)
    location = f"https://youtube-cutter-static-files.s3.amazonaws.com/{file_key}"

    return f"{yt.title} has been successfully uploaded to s3."

@app.route("/handle_full", methods=["POST"])
def handle_full():
    data = request.get_json()
    yt_id = data.get('yt_id')
    print(f"yt_id is {yt_id}")

    s3 = boto3.resource('s3')

    url = "https://www.youtube.com/watch?v=" + yt_id
    yt = YouTube(url)
    
    video = yt.streams.filter(only_audio=True).first()
    out_file = video.download(output_path="/tmp/")
    base, ext = os.path.splitext(out_file)
    new_file = f"/tmp/{yt_id}.mp3"
    os.rename(out_file, new_file)

    print(f"download complete of {new_file}! Now uploading to s3...")

    bucket_name = 'youtube-cutter-static-files'
    file_key = f"audio/{yt_id}.mp3"
    metadata = {'title': yt.title}
    s3.meta.client.upload_file(new_file, bucket_name, file_key, ExtraArgs={'ACL': 'public-read', 'Metadata': metadata})

    print(f"upload to s3 complete! Now sending s3 url as response...")

    location = f"https://youtube-cutter-static-files.s3.amazonaws.com/{file_key}"

    return location

@app.route("/handle_cut", methods=["POST"])
def handle_cut():
    data = request.get_json()
    yt_id = data.get('yt_id')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    
    s3_client = boto3.client('s3')
    bucket_name = "https://youtube-cutter-static-files.s3.amazonaws.com"

    # downloaded full file from s3 (previously uploaded)
    full_file = yt_id + ".mp3"
    object_key = f"audio/{full_file}"
    file_name = f"/tmp/{full_file}"

    try:
        s3_client.download_file(bucket_name, object_key, file_name)
        print(f"File '{object_key}' downloaded from S3 bucket '{bucket_name}' and saved as '{file_name}'.")
    except Exception as e:
        print(f"Error occurred while downloading file from S3: {e}")

    # cutting file
    cut_file = f"/tmp/{yt_id}-cut.mp3"
    print(f'cutting {file_name} into {cut_file}')
    # ffmpeg_exec = "./binaries/ffmpeg" # local
    ffmpeg_exec = "/opt/bin/ffmpeg" # deployment
    ffmpeg_command = f'{ffmpeg_exec} -i {file_name} -ss {start_time} -to {end_time} -y {cut_file}'

    try:
        subprocess.check_output(ffmpeg_command, shell=True)
        print('File successfully cut.')
    except subprocess.CalledProcessError as e:
        print('Error occurred while cutting the file:', e)

    # uploading cut file to s3
    s3 = boto3.resource('s3')
    bucket_name = 'youtube-cutter-static-files'
    file_key = f"audio/{yt_id}-cut.mp3"
    # metadata = {'title': yt.title}
    s3.meta.client.upload_file(cut_file, bucket_name, file_key, ExtraArgs={'ACL': 'public-read'})

    print(f"upload to s3 complete! Now sending s3 url as response...")

    location = f"https://youtube-cutter-static-files.s3.amazonaws.com/{file_key}"

    return location


@app.route("/test", methods=["POST"])
def handle_test():
    subprocess.run(["/opt/bin/ffmpeg", "-version"], check=True)

    return "done"

@app.route('/')
def serve():
    return render_template('index.html')

# # This code will only be executed when running the development server
# if __name__ == '__main__':
#     print("hello cors")
#     app.run(debug=True)