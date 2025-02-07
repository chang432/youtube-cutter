from flask_restful import Resource
from flask import request, make_response, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import boto3
import datetime

class PremiumVerificationHandler(Resource):
  @jwt_required()
  def get(self):
    print("[CUSTOM] STARTING and ENDING PremiumVerificationHandler.py (This request is only needed to verify jwt token)")
    
    # user = get_jwt_identity()
    # print(f"Hello, {user}! This is a protected route.")
