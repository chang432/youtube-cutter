from flask_restful import Api, Resource, reqparse
from flask import Flask, render_template, send_file, request
import boto3
import os
import subprocess

class CleanupHandler(Resource):
  def post(self):
    print("[CUSTOM] STARTING CleanupHandler.py")
    data = request.get_json()
    yt_title = data.get('yt_title')

    s3_client = boto3.client('s3')
    bucket_name = "youtube-cutter-static-files-dev"

    full_file = yt_title + ".mp4"
    full_file_wav = yt_title + ".wav"
    full_file_mp3 = yt_title + ".mp3"
    cut_file_wav = yt_title + "-cut.wav"
    cut_file_mp3 = yt_title + "-cut.mp3"
    
    try:
        s3_client.delete_object(Bucket=bucket_name, Key="audio/"+full_file)
        s3_client.delete_object(Bucket=bucket_name, Key="audio/"+cut_file_wav)
        s3_client.delete_object(Bucket=bucket_name, Key="audio/"+cut_file_mp3)
        s3_client.delete_object(Bucket=bucket_name, Key="audio/"+full_file_wav)
        s3_client.delete_object(Bucket=bucket_name, Key="audio/"+full_file_mp3)
    except Exception as e:
        print(f"[CUSTOM] Error occurred while deleting cut audio from S3: {e}")
    
    print("[CUSTOM] CleanupHandler.py COMPLETE")