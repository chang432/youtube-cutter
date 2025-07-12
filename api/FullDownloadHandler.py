from flask_restful import Api, Resource, reqparse
from flask import Flask, render_template, send_file, request, jsonify
from datetime import datetime
from botocore.errorfactory import ClientError
from api.YtdlpHandler import YtdlpHandler
import subprocess
import boto3
import os
import re
import time

DOWNLOAD_LIMIT = 1.5  # In hours

BUCKET_NAME = "youtube-cutter-static-files-dev"

S3_CLIENT = boto3.client('s3')
S3_RESOURCE = boto3.resource('s3')

LOCAL_METRICS_PATH = "/tmp/metrics.txt"

def sanitize(title: str):
    title = re.sub(r'[^\x00-\x7f]',r'', title)
    title = title.lower()
    # title = title.replace('free', '')
    title = title.strip()
    title = title.replace(' ','_')
    toReplace = '[](){}"“.,@#*&<>:;/\\|+?$' + "'"
    for char in toReplace:
        title = title.replace(char, '')
    return title.replace('\n','')

""" 
is_mp3: ("MP3" or "WAV")
is_cut: ("CUT" or "FULL")
"""
def uploadMetrics(title, is_mp3, is_cut):
  # Collect metrics
  print(f"[CUSTOM] collecting metrics for full download")
  curr_time = datetime.now()
  curr_month_year = str(curr_time.month) + "-" + str(curr_time.year)
  metrics_file_key = f"metrics/{curr_month_year}.txt"
  
  extension = "WAV"
  if is_mp3:
    extension = "MP3"

  download_type = "FULL"
  if is_cut:
    download_type = "CUT"

  try:
    S3_CLIENT.head_object(Bucket=BUCKET_NAME, Key=metrics_file_key)
    S3_CLIENT.download_file(BUCKET_NAME, metrics_file_key, LOCAL_METRICS_PATH)

    with open(LOCAL_METRICS_PATH, 'a') as file:
      clean_yt_title = title.replace("\n","")
      file.write(f'[{download_type}]-[{extension}]-[{curr_time.strftime("%d-%H:%M")}]-{clean_yt_title}\n')
  except ClientError as e:
    if e.response['Error']['Code'] == "404":
      # The key does not exist
      print(f"[CUSTOM] metric file not found, creating new one")
      clean_yt_title = title.replace("\n","")
      with open(LOCAL_METRICS_PATH, 'w') as file:
        file.write(f'[{download_type}]-[{extension}]-[{curr_time.strftime("%d-%H:%M")}]-{clean_yt_title}\n')
  
  S3_CLIENT.upload_file(LOCAL_METRICS_PATH, BUCKET_NAME, metrics_file_key)

class FullDownloadHandler(Resource):
  def post(self):
    start_time = time.time()
    print("[CUSTOM] STARTING FullDownloadHandler.py")

    data = request.get_json()
    yt_id = data.get('yt_id')
    is_cut = data.get('is_cut')
    download_mp3 = data.get('download_mp3')

    print(f"[CUSTOM] yt_id is {yt_id}, is_cut is {is_cut}")

    url = "https://youtube.com/watch?v=" + yt_id
    yt_object = YtdlpHandler(url)

    yt_info = yt_object.yt_dlp_request(False)

    # set a limit on video length for cuts
    duration_hours = yt_info["duration"] / 3600
    print(f"duration in hours is {duration_hours}")
    if duration_hours > DOWNLOAD_LIMIT:
      return {"error": "true", "message": f"this video is over the limit of {DOWNLOAD_LIMIT} hours"}

    yt_title = sanitize(yt_info["title"])

    destination_filename = yt_object.yt_dlp_request(True)['destfilename']

    new_file = f"/tmp/{yt_id}.m4a"
    os.rename(destination_filename, new_file)

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
      ffmpeg_command = f'{ffmpeg_exec} -loglevel error -i "{new_file}" -write_xing 0 -y "{converted_file}"'

      try:
        subprocess.check_output(ffmpeg_command, shell=True)
        print(f'[CUSTOM] File successfully converted to {converted_file}')
      except Exception as e:
        print(f"[CUSTOM] Error occurred while converting to {converted_file}: {e}")

      os.remove(new_file)
      new_file = converted_file

    print(f"[CUSTOM] download from youtube complete of {new_file}! Now uploading to s3...")

    file_key = f"audio/{yt_title}.m4a"
    if not is_cut:
      file_key = f"audio/{yt_title}.mp3" if download_mp3 else f"audio/{yt_title}.wav"
    S3_RESOURCE.meta.client.upload_file(new_file, BUCKET_NAME, file_key, ExtraArgs={'ACL': 'public-read'})

    # Removing file from tmp folder
    os.remove(new_file)

    print(f"[CUSTOM] upload to {BUCKET_NAME}/{file_key} complete! Uploading metrics...")

    uploadMetrics(yt_title, download_mp3, is_cut)

    print("[CUSTOM] Sending s3 url as response...")
    location = f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_key}"

    print(f"[CUSTOM] FINISHING FullDownloadHandler.py, took {(time.time() - start_time)} seconds")
    return {"error": "false", "url": location, "title": yt_title}