from flask_restful import Resource
from flask import request
from datetime import datetime, timezone
import boto3
import random
import string

class KofiWebhookHandler(Resource):
  
  def post(self):
    print("[CUSTOM] STARTING KofiWebhookHandler.py")

    correct_verification_token = "c0e0c9f5-96f4-4515-80b7-4b3ab6fb46b1"

    data = request.get_json()
    verification_token = data.get('verification_token')
    email = data.get('email')
    is_subscription_payment = data.get('is_subscription_payment')
    is_first_subscription_payment = data.get('is_first_subscription_payment')

    if verification_token != correct_verification_token:
      raise Exception("Verification token does not match")

    s3_client = boto3.client('s3')
    bucket_name = "youtube-cutter-private-dev"
    key_name = "premium_subscribers.txt"

    try:
      response = s3_client.get_object(Bucket=bucket_name, Key=key_name)
      content = response['Body'].read().decode('utf-8')
    except s3_client.exceptions.NoSuchKey:
      content = ""

    if is_first_subscription_payment:
      # Generate random password
      chars = string.ascii_uppercase + string.digits  # A-Z, 0-9
      password = "-".join("".join(random.choices(chars, k=4)) for _ in range(3))

      # Add user info to prem_subscribers.txt
      curr_dt = datetime.now(timezone.utc)
      curr_dt_str = curr_dt.strftime("%Y-%m-%d")

      if email in content:
        raise Exception("User with the specified email already in premium_subscribers.txt")

      content += password + "," + email + "," + curr_dt_str + "\n"

      s3_client.put_object(Bucket=bucket_name, Key=key_name, Body=content.encode('utf-8'))

      # Email the password to the input email 
      ses = boto3.client("ses", region_name="us-east-1")  # Change region if needed

      SENDER = "wavninja.team@gmail.com"
      RECIPIENT = email
      SUBJECT = "Wav Ninja Premium Feature Password"
      BODY_TEXT = "Thank you for supporting us!\nPlease use the following password to access premium features: " + password + "\n\n- Wav Ninja Team"

      response = ses.send_email(
          Source=SENDER,
          Destination={"ToAddresses": [RECIPIENT]},
          Message={
              "Subject": {"Data": SUBJECT},
              "Body": {"Text": {"Data": BODY_TEXT}},
          },
      )
    
    elif is_subscription_payment:
      
      curr_dt = datetime.now(timezone.utc)
      curr_dt_str = curr_dt.strftime("%Y-%m-%d")

      content_arr = content.split("\n")

      new_content_arr = [line.replace(line[line.rindex(",")+1:], curr_dt_str) if email in line else line for line in content_arr]
      new_content = "\n".join(new_content_arr)
      
      s3_client.put_object(Bucket=bucket_name, Key=key_name, Body=new_content.encode('utf-8'))
      
    print("[CUSTOM] KofiWebhookHandler.py COMPLETE")

    return "done"