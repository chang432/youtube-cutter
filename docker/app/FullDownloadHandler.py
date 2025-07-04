from flask_restful import Api, Resource, reqparse
from flask import Flask, render_template, send_file, request, jsonify
from datetime import datetime
from YtdlpHandler import YtdlpHandler
import subprocess
import os
import shutil
import re
import time

DOWNLOAD_LIMIT = 2  # In hours

AUDIO_PATH="/audio"

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

    new_file = f"{AUDIO_PATH}/{yt_id}.m4a"
    shutil.move(destination_filename, new_file)

    if not is_cut:
      ffmpeg_exec = "/opt/bin/ffmpeg" # deployment
      
      if download_mp3:
        converted_file = f"{AUDIO_PATH}/{yt_id}.mp3"
      else:
        converted_file = f"{AUDIO_PATH}/{yt_id}.wav"

      print(download_mp3, converted_file)
      ffmpeg_command = f'{ffmpeg_exec} -loglevel error -i "{new_file}" -write_xing 0 -y "{converted_file}"'

      try:
        subprocess.check_output(ffmpeg_command, shell=True)
        print(f'[CUSTOM] File successfully converted to {converted_file}')
      except Exception as e:
        print(f"[CUSTOM] Error occurred while converting to {converted_file}: {e}")

      os.remove(new_file)
      new_file = converted_file

    output_file = f"{AUDIO_PATH}/{yt_title}.m4a"
    if not is_cut:
      output_file = f"{AUDIO_PATH}/{yt_title}.mp3" if download_mp3 else f"{AUDIO_PATH}/{yt_title}.wav"
    
    os.rename(new_file, output_file)

    print(f"[CUSTOM] download from youtube complete of {output_file}!")

    print(f"[CUSTOM] FINISHING FullDownloadHandler.py, took {(time.time() - start_time)} seconds")
    return {"error": "false", "title": yt_title}