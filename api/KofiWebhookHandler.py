from flask_restful import Resource
from flask import request
from datetime import datetime, timezone
from api.DynamoDbHelper import DynamoDbHelper
import boto3
import random
import string

class KofiWebhookHandler(Resource):
  
  def post(self):
    print("[CUSTOM] STARTING KofiWebhookHandler.py")

    ddb_helper = DynamoDbHelper("youtube-cutter-dev-premium-subscribers")

    correct_verification_token = "c0e0c9f5-96f4-4515-80b7-4b3ab6fb46b1"

    data = request.get_json()
    verification_token = data.get('verification_token')
    email = data.get('email')
    is_subscription_payment = data.get('is_subscription_payment')
    is_first_subscription_payment = data.get('is_first_subscription_payment')

    if verification_token != correct_verification_token:
      raise Exception("Verification token does not match")

    if is_first_subscription_payment:
      print(f"First subscription detected for {email}! Setting up now...")

      # Generate random password
      chars = string.ascii_uppercase + string.digits  # A-Z, 0-9
      password = "-".join("".join(random.choices(chars, k=4)) for _ in range(3))

      # Add user info to prem_subscribers.txt
      curr_dt = datetime.now(timezone)
      curr_dt_str = curr_dt.strftime("%Y-%m-%d")

      ddb_helper.putItem(email=email, access_key=password, timestamp=curr_dt_str)

      # Email the password to the input email 
      ses_client = boto3.client("ses", region_name="us-east-1")  # Change region if needed

      SENDER = "wavninja.team@gmail.com"
      RECIPIENT = email
      SUBJECT = "Wav Ninja Premium"
      BODY_TEXT = "Thank you for supporting us!\nPlease use the following password to access premium features: " + password + "\n\n- Wav Ninja Team"

      response = ses_client.send_email(
          Source=SENDER,
          Destination={"ToAddresses": [RECIPIENT]},
          Message={
              "Subject": {"Data": SUBJECT},
              "Body": {"Text": {"Data": BODY_TEXT}},
          },
      )
    
    elif is_subscription_payment:
      print(f"subscription payment detected for {email}! Updating timestamp now...")
      curr_dt = datetime.now(timezone)
      curr_dt_str = curr_dt.strftime("%Y-%m-%d")

      ddb_helper.updateItem(email=email, new_timestamp=curr_dt_str)
            
    print("[CUSTOM] KofiWebhookHandler.py COMPLETE")

    return "done"