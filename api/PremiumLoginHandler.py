from flask_restful import Resource
from flask import request, make_response, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import boto3
import datetime

class PremiumLoginHandler(Resource):
  def post(self):
    print("[CUSTOM] STARTING PremiumLoginHandler.py")
    data = request.get_json()
    password = data.get('input_password')

    s3_client = boto3.client("s3")
    response = s3_client.get_object(Bucket="youtube-cutter-private-dev", Key="premium_subscribers.txt")
    content = response["Body"].read().decode("utf-8")

    print("[CUSTOM] PremiumLoginHandler.py COMPLETE")

    response = make_response(jsonify({ 'authorized': False }))

    if (password in content):
      response = make_response(jsonify({ 'authorized': True }))

      token = create_access_token(identity=password, expires_delta=datetime.timedelta(days=30))
      
      # Set secure HTTP-only cookie
      response.set_cookie(
          "access_token_cookie", token, httponly=True, secure=True, samesite="Strict"
      )
    
    return response