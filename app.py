from flask import Flask, render_template
from flask_s3 import FlaskS3
from flask_restful import Api
from flask_jwt_extended import JWTManager
import os
import boto3

# env variable for local or deployment build
os.environ["IS_DEPLOYMENT"] = "FALSE"

if os.environ["IS_DEPLOYMENT"] == "FALSE": 
    from flask_cors import CORS

app = Flask(__name__, template_folder='frontend/dist', static_folder='frontend/dist/assets')

if os.environ["IS_DEPLOYMENT"] == "FALSE": 
    CORS(app, supports_credentials=True)

app.config['FLASKS3_BUCKET_NAME'] = 'youtube-cutter-static-files-dev'
s3 = FlaskS3(app)
api = Api(app)

@app.route('/')
def serve():
    return render_template('index.html')