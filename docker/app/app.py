from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from FullDownloadHandler import FullDownloadHandler
from CleanupHandler import CleanupHandler

app = Flask(__name__)
CORS(app)

api = Api(app)
api.add_resource(FullDownloadHandler, "/handle_yt")
api.add_resource(CleanupHandler, "/cleanup")