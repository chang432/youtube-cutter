from flask_restful import Api, Resource, reqparse
from flask import Flask, render_template, send_file, request, jsonify
from pytube import YouTube
import subprocess
import boto3
import os
import re

def sanitize(title: str):
    title = re.sub(r'[^\x00-\x7f]',r'', title)
    title = title.lower()
    # title = title.replace('free', '')
    title = title.strip()
    title = title.replace(' ','_')
    toReplace = '[](){}"“.,@#*&<>:;/\\|+' + "'"
    for char in toReplace:
        title = title.replace(char, '')
    return title

class FullDownloadHandler(Resource):
  def post(self):
    print("[CUSTOM] STARTING FullDownloadHandler.py")
    data = request.get_json()
    yt_id = data.get('yt_id')
    is_cut = data.get('is_cut')
    download_mp3 = data.get('download_mp3')

    print(f"[CUSTOM] yt_id is {yt_id}, is_cut is {is_cut}")

    s3 = boto3.resource('s3')

    url = "https://www.youtube.com/watch?v=" + yt_id
    yt = YouTube(url, use_oauth=False, allow_oauth_cache=False)

    yt_title = sanitize(yt.title)
    audio = yt.streams.filter(only_audio=True).first()
    out_file = audio.download(output_path="/tmp/")
    base, ext = os.path.splitext(out_file)
    new_file = f"/tmp/{yt_id}.mp4"
    os.rename(out_file, new_file)

    if not is_cut:
      if os.environ["IS_DEPLOYMENT"] == "FALSE":
        ffmpeg_exec = "./binaries/ffmpeg" # local
      else:
        ffmpeg_exec = "/opt/bin/ffmpeg" # deployment
      
      if download_mp3:
        converted_file = f"/tmp/{yt_id}.mp3"
      else:
        converted_file = f"/tmp/{yt_id}.wav"

      print(download_mp3, converted_file)
      ffmpeg_command = f'{ffmpeg_exec} -i "{new_file}" -write_xing 0 -y "{converted_file}"'

      try:
        subprocess.check_output(ffmpeg_command, shell=True)
        print(f'[CUSTOM] File successfully converted to {converted_file}')
      except Exception as e:
        print(f"[CUSTOM] Error occurred while converting to {converted_file}: {e}")

      os.remove(new_file)
      new_file = converted_file

    print(f"[CUSTOM] download from youtube complete of {new_file}! Now uploading to s3...")

    bucket_name = 'youtube-cutter-static-files-dev'
    file_key = f"audio/{yt_title}.mp4"
    if not is_cut:
      file_key = f"audio/{yt_title}.mp3" if download_mp3 else f"audio/{yt_title}.wav"
    s3.meta.client.upload_file(new_file, bucket_name, file_key, ExtraArgs={'ACL': 'public-read'})

    # Removing file from tmp folder
    os.remove(new_file)

    print(f"[CUSTOM] upload to {bucket_name}/{file_key} complete! Now sending s3 url as response...")
    location = f"https://youtube-cutter-static-files-dev.s3.amazonaws.com/{file_key}"

    print("[CUSTOM] FINISHING FullDownloadHandler.py")
    return {"url": location, "title": yt_title}