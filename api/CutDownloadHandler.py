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

    yt_title = data.get('yt_title')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    audio_type = data.get('audio_type')

    s3_client = boto3.client('s3')
    bucket_name = "youtube-cutter-static-files-dev"

    # download full file from s3 (previously uploaded)
    full_file = yt_title + ".mp4"
    object_key = f"audio/{full_file}"
    file_name = f"/tmp/{full_file}"

    try:
        s3_client.download_file(bucket_name, object_key, file_name)
        print(f"[CUSTOM] Full mp4 '{object_key}' downloaded from S3 bucket '{bucket_name}' and saved as '{file_name}'.")
    except Exception as e:
        print(f"[CUSTOM] Error occurred while downloading full audio from S3: {e}")

    try:
        s3_client.delete_object(Bucket=bucket_name, Key=object_key)
    except Exception as e:
        print(f"[CUSTOM] Error occurred while deleting full audio from S3: {e}")

    # cutting file
    cut_file = f"/tmp/{yt_title}-cut.mp3" if audio_type == "MP3" else f"/tmp/{yt_title}-cut.wav"
    print(f'[CUSTOM] cutting {file_name} into {cut_file} from {start_time} to {end_time}')

    if os.environ["IS_DEPLOYMENT"] == "FALSE":
        ffmpeg_exec = "./binaries/ffmpeg" # local
    else:
        ffmpeg_exec = "/opt/bin/ffmpeg" # deployment
    ffmpeg_command = f'{ffmpeg_exec} -i "{file_name}" -ss "{start_time}" -to "{end_time}" -write_xing 0 -y "{cut_file}"'

    try:
        subprocess.check_output(ffmpeg_command, shell=True)
        print('[CUSTOM] File successfully cut.')
    except subprocess.CalledProcessError as e:
        print('[CUSTOM] Error occurred while cutting the file:', e)

    # uploading cut file to s3
    s3 = boto3.resource('s3')
    bucket_name = 'youtube-cutter-static-files-dev'
    file_key = f"audio/{yt_title}-cut.mp3" if audio_type == "MP3" else f"audio/{yt_title}-cut.wav"
    s3.meta.client.upload_file(cut_file, bucket_name, file_key, ExtraArgs={'ACL': 'public-read'})

    # cleaning up cut file 
    os.remove(cut_file)

    print(f"[CUSTOM] upload of cut file {bucket_name}/{file_key} complete! Now sending s3 url as response...")

    location = f"https://youtube-cutter-static-files-dev.s3.amazonaws.com/{file_key}"

    print("[CUSTOM] FINISHING CutDownloadHandler.py")
    return {"url": location, "title": yt_title}