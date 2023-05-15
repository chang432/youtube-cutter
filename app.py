from flask import Flask, render_template, send_file
from flask_s3 import FlaskS3
from flask_restful import Api
from api.HelloApiHandler import HelloApiHandler
from flask_cors import CORS, cross_origin
import yt_dlp

app = Flask(__name__, template_folder='frontend/dist', static_folder='frontend/dist/assets')
CORS(app)
app.config['FLASKS3_BUCKET_NAME'] = 'youtube-cutter-static-files'
s3 = FlaskS3(app)
api = Api(app)

@app.route('/hello/<name>')
def say_hello(name):
    print(f"hellooo {name}")
    return f'Hello, {name}!'

@app.route('/download/<vid>')
def youtube_download(vid):
    url = "https://www.youtube.com/watch?v=" + vid
    ydl_opts = {
        'format': 'mp3/bestaudio/best',
        # ℹ️ See help(yt_dlp.postprocessor) for a list of available Postprocessors and their arguments
        'postprocessors': [{  # Extract audio using ffmpeg
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }],
        'postprocessor_args': ["-ss", "00:00:30", "-to", "00:01:00"]
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        error_code = ydl.download([url])

    return f'Hello, {vid}!'

api.add_resource(HelloApiHandler, '/flask/hello')

@app.route("/post", methods=["POST"])
def testpost():
    return send_file("lilwaifu.mp3", mimetype="audio/mp3")

@app.route('/')
def serve():
    return render_template('index.html')