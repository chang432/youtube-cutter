from flask_restful import Resource
from flask import jsonify, request
import os

class CleanupHandler(Resource):
  def post(self):
    print("[CUSTOM] STARTING CleanupHandler.py", flush=True)
    data = request.get_json()
    yt_title = data.get('yt_title')

    audio_path = "/audio"
    full_file = yt_title + ".m4a"
    full_file_wav = yt_title + ".wav"
    full_file_mp3 = yt_title + ".mp3"
    
    try:
        if os.path.exists(audio_path + "/" + full_file):
          os.remove(audio_path + "/" + full_file)
        if os.path.exists(audio_path + "/" + full_file_wav):
          os.remove(audio_path + "/" + full_file_wav)  
        if os.path.exists(audio_path + "/" + full_file_mp3):
          os.remove(audio_path + "/" + full_file_mp3)  
    except Exception as e:
        print(f"[CUSTOM] Error occurred while deleting from /audio: {e}", flush=True)
    
    print("[CUSTOM] CleanupHandler.py COMPLETE", flush=True)

    return jsonify({"status": "done"})