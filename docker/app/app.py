from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from FullDownloadHandler import FullDownloadHandler
from CleanupHandler import CleanupHandler

app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:5000", "https://wav.ninja", "https://youtube-cutter-dev-1942500617.us-east-1.elb.amazonaws.com"])

api = Api(app)
api.add_resource(FullDownloadHandler, "/handle_yt")
api.add_resource(CleanupHandler, "/cleanup")