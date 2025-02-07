from flask_restful import Resource
from flask import request, make_response, jsonify
from flask_jwt_extended import create_access_token
from DynamoDbHelper import DynamoDbHelper
import datetime

class PremiumLoginHandler(Resource):
  def post(self):
    print("[CUSTOM] STARTING PremiumLoginHandler.py")
    data = request.get_json()
    password = data.get('input_password')

    ddb_helper = DynamoDbHelper(table_name="youtube-cutter-dev-premium-subscribers")

    response = make_response(jsonify({ 'authorized': False }))

    if (ddb_helper.checkItem(input_access_key=password)):
      response = make_response(jsonify({ 'authorized': True }))

      token = create_access_token(identity=password, expires_delta=datetime.timedelta(days=30))
      
      # Set secure HTTP-only cookie
      response.set_cookie(
          "access_token_cookie", token, httponly=True, secure=True, samesite="Strict"
      )
    
    print("[CUSTOM] PremiumLoginHandler.py COMPLETE")

    return response