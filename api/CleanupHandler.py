from flask_restful import Api, Resource, reqparse
from flask import Flask, render_template, send_file, request
from pytube import YouTube
import boto3
import os
import subprocess

class CleanupHandler(Resource):
  def post(self):
    print("[CUSTOM] STARTING CleanupHandler.py")
    data = request.get_json()
    yt_id = data.get('yt_id')

    s3_client = boto3.client('s3')
    bucket_name = "youtube-cutter-static-files"

    cut_file_wav = yt_id + "-cut.wav"
    cut_file_mp3 = yt_id + "-cut.mp3"
    
    try:
        s3_client.delete_object(Bucket=bucket_name, Key="audio/"+cut_file_wav)
        s3_client.delete_object(Bucket=bucket_name, Key="audio/"+cut_file_mp3)
    except Exception as e:
        print(f"[CUSTOM] Error occurred while deleting cut audio from S3: {e}")