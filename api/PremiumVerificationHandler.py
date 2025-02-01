from flask_restful import Resource
from flask import request
import boto3

class PremiumVerificationHandler(Resource):
  def post(self):
    print("[CUSTOM] STARTING PremiumVerificationHandler.py")
    data = request.get_json()
    password = data.get('input_password')

    s3_client = boto3.client("s3")
    response = s3_client.get_object(Bucket="youtube-cutter-private-dev", Key="premium_subscribers.txt")
    content = response["Body"].read().decode("utf-8")

    print("[CUSTOM] PremiumVerificationHandler.py COMPLETE")

    if (password in content):
        return { 'authorized': True }

    return { 'authorized': False }