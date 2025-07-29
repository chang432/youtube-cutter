from flask_restful import Resource
from flask import request
from datetime import datetime, timezone
from api.DynamoDbHelper import DynamoDbHelper
from api.SmtpHelper import SmtpHelper
from flask import jsonify, make_response
import json
import boto3
import random
import string

class KofiWebhookHandler(Resource):
  
  def post(self):
    try:
      print("[CUSTOM] STARTING KofiWebhookHandler.py")

      correct_verification_token = "c0e0c9f5-96f4-4515-80b7-4b3ab6fb46b1"

      request_data = request.form.to_dict()

      if "data" in request_data:
        # Actual request sent from Ko-fi
        data = json.loads(request_data["data"])
      else:
        # Test request sent from monitoring
        data = request_data

      print(f"[DATA]: {data}")

      testing = False
      if 'testing' in data:
        testing = data['testing']
      verification_token = data['verification_token']
      email = data['email']
      is_subscription_payment = data['is_subscription_payment']
      is_first_subscription_payment = data['is_first_subscription_payment']

      print(f"DATA CONTENTS:\ntesting: {testing}\nverification_token: {verification_token}\nemail: {email}\nis_subscription_payment: {is_subscription_payment}\nis_first_subscription_payment: {is_first_subscription_payment}")

      if testing:
        ddb_helper = DynamoDbHelper(table_name="youtube-cutter-test-premium-subscribers")
      else:
        ddb_helper = DynamoDbHelper(table_name="youtube-cutter-dev-premium-subscribers")

      if verification_token != correct_verification_token:
        raise Exception("Verification token does not match")
      
      if is_subscription_payment and not is_first_subscription_payment:
        print(f"subscription payment detected for {email}! Updating timestamp now...")
        curr_dt = datetime.now(timezone.utc)
        curr_dt_str = curr_dt.strftime("%Y-%m-%d")

        ddb_helper.updateItem(email=email, new_timestamp=curr_dt_str)
      else:
        print(f"First subscription or one time payment detected for {email}! Setting up now...")

        # Generate random password
        chars = string.ascii_uppercase + string.digits  # A-Z, 0-9
        password = "-".join("".join(random.choices(chars, k=4)) for _ in range(3))

        # Add user info to db
        curr_dt = datetime.now(timezone.utc)
        curr_dt_str = curr_dt.strftime("%Y-%m-%d")

        ddb_helper.putItem(email=email, access_key=password, timestamp=curr_dt_str)

        if not testing:
          # Email the password to the input email 
          SUBJECT = "Wav Ninja Premium"
          BODY_TEXT = "Thank you for supporting us!\nPlease use the following password to access premium features: " + password + "\n\n- Wav Ninja Team"

          SmtpHelper.sendEmail(destinationEmail=email, emailTitle=SUBJECT, emailBody=BODY_TEXT)
              
      print("[CUSTOM] KofiWebhookHandler.py COMPLETE")

      return make_response(jsonify({"status": "success"}), 200)
    except Exception as e:
      return make_response(jsonify({"error": str(e)}), 500)