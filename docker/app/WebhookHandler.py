from flask_restful import Resource
from flask import jsonify, request
import os

class WebHookHandler(Resource):
  def post(self):
    print("[CUSTOM] STARTING WebHookHandler.py", flush=True)
    data = request.get_json()
    print(data, flush=True)