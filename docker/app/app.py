from flask import Flask, jsonify, request
from flask_restful import Api
from FullDownloadHandler import FullDownloadHandler

app = Flask(__name__)

api = Api(app)
api.add_resource(FullDownloadHandler, "/handle_full")