from flask_restful import Api, Resource, reqparse
from flask import Flask, render_template, send_file, request, jsonify
from pytube import YouTube
import boto3
import os

class FullDownloadHandler(Resource):
  def post(self):
    print("[CUSTOM] STARTING FullDownloadHandler.py")
    data = request.get_json()
    yt_id = data.get('yt_id')
    print(f"[CUSTOM] yt_id is {yt_id}")

    s3 = boto3.resource('s3')

    url = "https://www.youtube.com/watch?v=" + yt_id
    yt = YouTube(url, use_oauth=True, allow_oauth_cache=True)
    
    audio = yt.streams.filter(only_audio=True).first()
    out_file = audio.download(output_path="/tmp/")
    base, ext = os.path.splitext(out_file)
    new_file = f"/tmp/{yt_id}.mp3"
    os.rename(out_file, new_file)

    print(f"[CUSTOM] download from youtube complete of {new_file}! Now uploading to s3...")

    bucket_name = 'youtube-cutter-static-files'
    file_key = f"audio/{yt_id}.mp3"
    s3.meta.client.upload_file(new_file, bucket_name, file_key, ExtraArgs={'ACL': 'public-read'})

    print(f"[CUSTOM] upload to {bucket_name}/{file_key} complete! Now sending s3 url as response...")
    location = f"https://youtube-cutter-static-files.s3.amazonaws.com/{file_key}"

    print("[CUSTOM] FINISHING FullDownloadHandler.py")
    return {"url": location}