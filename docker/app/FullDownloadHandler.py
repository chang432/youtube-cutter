from flask_restful import Api, Resource, reqparse
from flask import Flask, render_template, send_file, request, jsonify
from datetime import datetime
from YtdlpHandler import YtdlpHandler
from CookiesManager import CookiesManager
import subprocess
import os
import shutil
import re
import time
from Logger import Logger

# Import for JWT
from flask_jwt_extended import verify_jwt_in_request

PID = os.getpid()
YT_ID = None

LOCAL_METRICS_PATH = f"/var/log/metrics/metrics_{PID}.log"   # set in docker-compose.yml

HOST_ENDPOINT = os.getenv("HOST_ENDPOINT") 

DOWNLOAD_LIMIT = 180  # In minutes

AUDIO_PATH="/audio"

APP_ENV = os.getenv("APP_ENV")

FFMPEG_EXEC = "/opt/bin/ffmpeg"

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
def processMetrics(title, is_mp3, is_cut):
  # Collect metrics
  curr_time = datetime.now()
  # curr_month_year = str(curr_time.year)+"_"+str(curr_time.month)
  # metrics_file_key = f"metrics/{curr_month_year}.txt"
  
  extension = "WAV"
  if is_mp3:
    extension = "MP3"

  download_type = "FULL"
  if is_cut:
    download_type = "CUT"

  try:
    with open(LOCAL_METRICS_PATH, 'a') as file:
      clean_yt_title = title.replace("\n","")
      file.write(f'[{download_type}]-[{extension}]-[{curr_time.strftime("%d-%H:%M")}]-{clean_yt_title}\n')
  except ClientError as e:
    if e.response['Error']['Code'] == "404":
      # The key does not exist
      Logger.log(f"metric file not found, creating new one", PID, YT_ID)
      clean_yt_title = title.replace("\n","")
      with open(LOCAL_METRICS_PATH, 'w') as file:
        file.write(f'[{download_type}]-[{extension}]-[{curr_time.strftime("%d-%H:%M")}]-{clean_yt_title}\n')
  
  Logger.log(f"{LOCAL_METRICS_PATH} updated", PID, YT_ID)


class FullDownloadHandler(Resource):
  def post(self):
    global YT_ID

    start_time = time.time()

    data = request.get_json()
    yt_id = data.get('yt_id')
    is_cut = data.get('is_cut')
    download_mp3 = data.get('download_mp3')

    YT_ID = yt_id

    Logger.log("========== Starting FullDownloadHandler.py ==========", PID, YT_ID)

    # Logger.log("headers: " + str(dict(request.headers)))
    # Logger.log("cookies: " + str(request.cookies))

    Logger.log(f"is_cut -> {is_cut}")

    cookies_manager = CookiesManager()
    cookies_path = cookies_manager.get_current_cookie_path()
    url = "https://youtube.com/watch?v=" + yt_id
    yt_object = YtdlpHandler(url, cookies_path)

    yt_info = yt_object.yt_dlp_request(False)

    # set a limit on video length
    duration_minutes = yt_info["duration"] / 60
    Logger.log(f"duration in minutes -> {duration_minutes}", PID, YT_ID)
    if duration_minutes > DOWNLOAD_LIMIT:
      return {"error": "true", "message": f"This video is over the limit of {DOWNLOAD_LIMIT} minutes!"}

    yt_title = sanitize(yt_info["title"])

    dst_filepath = yt_object.yt_dlp_request(True)['destfilepath']
   
    if download_mp3:
      converted_file = f"{AUDIO_PATH}/{yt_id}.mp3"
    else:
      # Cut default to wav
      converted_file = f"{AUDIO_PATH}/{yt_id}.wav"

    Logger.log(f"Converting from m4a to {converted_file}", PID, YT_ID)
    ffmpeg_command = f'{FFMPEG_EXEC} -loglevel error -i "{dst_filepath}" -write_xing 0 -y "{converted_file}"'

    try:
      subprocess.check_output(ffmpeg_command, shell=True)
      Logger.log(f'File successfully converted to {converted_file}', PID, YT_ID)
    except Exception as e:
      Logger.log(f"Error occurred while converting to {converted_file}: {e}", PID, YT_ID)

    os.remove(dst_filepath)
    dst_filepath = converted_file

    output_file_name = f"{yt_title}.wav"
    if not is_cut and download_mp3:
      output_file_name = f"{yt_title}.mp3"
    
    os.rename(dst_filepath, f"{AUDIO_PATH}/{output_file_name}")

    Logger.log(f"Download from youtube complete -> {output_file_name}!", PID, YT_ID)

    processMetrics(yt_title, download_mp3, is_cut)

    location = f"{HOST_ENDPOINT}/audio/{output_file_name}"

    Logger.log(f"========== FINISHING FullDownloadHandler.py, took {(time.time() - start_time)} seconds ==========", PID, YT_ID)
    return jsonify({"error": "false", "url": location, "title": yt_title})
