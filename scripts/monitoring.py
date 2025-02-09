import os
import traceback
import boto3
import requests
from api.DynamoDbHelper import DynamoDbHelper
from api.YtdlpHandler import YtdlpHandler

def check_pytube():
    print("========== [MONITORING] Starting Execution ==========")
    
    sns = boto3.client('sns')
    ddb_helper = DynamoDbHelper(table_name="youtube-cutter-test-premium-subscribers")

    print("[MONITORING] Starting yt-dlp download test...")
    
    try:
        url = "https://www.youtube.com/watch?v=oftolPu9qp4"
        yt = YtdlpHandler(url)
        destfilename = yt.yt_dlp_request(True)["destfilename"]
        os.remove(destfilename)
        print(f"[MONITORING] successfully tested download of {destfilename}")
    except:
        print("[MONITORING] yt-dlp download test EXCEPTION OCCURRED!!!!!")
        traceback.print_exc()

        sns.publish(
            TopicArn="arn:aws:sns:us-east-1:235154285215:wav-ninja-monitoring",
            Message="WAV NINJA MONITORING FAILED FOR Yt-dlp TEST PLEASE LOOK INTO IT"
        )
    
    print("[MONITORING] Starting PremiumLogHandler test...")

    try:
        # First add a entry to test db
        ddb_helper.putItem(email="andre888chang@gmail.com", access_key="1234-1234-1234",timestamp="2025-02-08")

        # Test a non existent password
        bad_data = {
            "input_password": "XXXX-XXXX-XXXX",
            "testing": True
        }

        bad_data_response = requests.post("https://youtube-cutter-dev-703951066.us-east-1.elb.amazonaws.com/login_premium", json=bad_data, verify=False)    # TODO: Change url to https://wav.ninja
        bad_data_response_json = bad_data_response.json()
        if bad_data_response_json["authorized"] != False:
            raise Exception("Request should have returned False!")

        data = {
            "input_password": "1234-1234-1234",
            "testing": True
        }

        response = requests.post("https://youtube-cutter-dev-703951066.us-east-1.elb.amazonaws.com/login_premium", json=data, verify=False)    # TODO: Change url to https://wav.ninja
        response_json = response.json()
        if response_json["authorized"] != True:
            raise Exception("Request should have returned True!")
        
        print(f"[MONITORING] successfully tested PremiumLogHandler logic")
    except:
        print("[MONITORING] PremiumLogHandler test EXCEPTION OCCURRED!!!!!")
        traceback.print_exc()

        sns.publish(
            TopicArn="arn:aws:sns:us-east-1:235154285215:wav-ninja-monitoring",
            Message="WAV NINJA MONITORING FAILED FOR PremiumLogHandler TEST PLEASE LOOK INTO IT"
        )

    print("========== [MONITORING] Ending Execution ==========")