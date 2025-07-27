from flask_restful import Resource
from flask import request, make_response, jsonify
from flask_jwt_extended import create_access_token, set_access_cookies
from api.DynamoDbHelper import DynamoDbHelper
import datetime

class PremiumLoginHandler(Resource):
  def post(self):
    print("[CUSTOM] STARTING PremiumLoginHandler.py")
    data = request.get_json()
    password = data.get('input_password')
    testing = data.get('testing')

    if (testing):
      ddb_helper = DynamoDbHelper(table_name="youtube-cutter-test-premium-subscribers")
    else:
      ddb_helper = DynamoDbHelper(table_name="youtube-cutter-dev-premium-subscribers")

    response = make_response(jsonify({ 'authorized': False }))

    if (ddb_helper.checkItem(input_access_key=password)):
      print("Password exists! Now creating and configuring access token...")

      token = create_access_token(identity=password, expires_delta=datetime.timedelta(days=30))
      
      response = make_response(jsonify({ 'authorized': True }))
      
      set_access_cookies(response, token)
    else:
      print("Password does not exist...")

    print("[CUSTOM] PremiumLoginHandler.py COMPLETE")

    return response