from flask import Flask, render_template, request
from flask_s3 import FlaskS3
from flask_restful import Api
from api.HelloApiHandler import HelloApiHandler
from api.FullDownloadHandler import FullDownloadHandler
from api.CutDownloadHandler import CutDownloadHandler
import os
from flask_cors import CORS
import boto3
import subprocess

app = Flask(__name__, template_folder='frontend/dist', static_folder='frontend/dist/assets')
CORS(app)
app.config['FLASKS3_BUCKET_NAME'] = 'youtube-cutter-static-files'
s3 = FlaskS3(app)
api = Api(app)

api.add_resource(HelloApiHandler, '/flask/hello')
api.add_resource(FullDownloadHandler, '/handle_full')
api.add_resource(CutDownloadHandler, '/handle_cut')

@app.route("/test", methods=["POST"])
def handle_test():
    subprocess.run(["/opt/bin/ffmpeg", "-version"], check=True)

    return "done"

@app.route('/')
def serve():
    return render_template('index.html')

# # This code will only be executed when running the development server
# if __name__ == '__main__':
#     print("hello cors")
#     app.run(debug=True)