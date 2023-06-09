from flask_restful import Api, Resource, reqparse
from flask import Flask, render_template, send_file, request
from pytube import YouTube
import boto3
import os
import subprocess

class CutDownloadHandler(Resource):
  def post(self):
    print("[CUSTOM] STARTING CutDownloadHandler.py")
    print(f"[CUSTOM] is deployment?: {os.environ['IS_DEPLOYMENT']}")
    data = request.get_json()

    yt_id = data.get('yt_id')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    audio_type = data.get('audio_type')

    s3_client = boto3.client('s3')
    bucket_name = "youtube-cutter-static-files"

    # downloaded full file from s3 (previously uploaded)
    full_file = yt_id + ".mp3"
    object_key = f"audio/{full_file}"
    file_name = f"/tmp/{full_file}"

    try:
        s3_client.download_file(bucket_name, object_key, file_name)
        print(f"[CUSTOM] Full mp3 '{object_key}' downloaded from S3 bucket '{bucket_name}' and saved as '{file_name}'.")
    except Exception as e:
        print(f"[CUSTOM] Error occurred while downloading file from S3: {e}")

    # cutting file
    cut_file = f"/tmp/{yt_id}-cut.mp3" if audio_type == "MP3" else f"/tmp/{yt_id}-cut.wav"
    print(f'[CUSTOM] cutting {file_name} into {cut_file} from {start_time} to {end_time}')

    if os.environ["IS_DEPLOYMENT"] == "FALSE":
        ffmpeg_exec = "./binaries/ffmpeg" # local
    else:
        ffmpeg_exec = "/opt/bin/ffmpeg" # deployment
    ffmpeg_command = f'{ffmpeg_exec} -i {file_name} -ss {start_time} -to {end_time} -y {cut_file}'

    try:
        subprocess.check_output(ffmpeg_command, shell=True)
        print('[CUSTOM] File successfully cut.')
    except subprocess.CalledProcessError as e:
        print('[CUSTOM] Error occurred while cutting the file:', e)

    # uploading cut file to s3
    s3 = boto3.resource('s3')
    bucket_name = 'youtube-cutter-static-files'
    file_key = f"audio/{yt_id}-cut.mp3" if audio_type == "MP3" else f"audio/{yt_id}-cut.wav"
    s3.meta.client.upload_file(cut_file, bucket_name, file_key, ExtraArgs={'ACL': 'public-read'})

    print(f"[CUSTOM] upload of cut file {bucket_name}/{file_key} complete! Now sending s3 url as response...")

    location = f"https://youtube-cutter-static-files.s3.amazonaws.com/{file_key}"

    print("[CUSTOM] FINISHING CutDownloadHandler.py")
    return {"url": location}