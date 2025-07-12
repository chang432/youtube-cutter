import os
import traceback
import boto3
import requests
# from api.DynamoDbHelper import DynamoDbHelper
# from api.YtdlpHandler import YtdlpHandler

sns = boto3.client('sns')

def check_wav_helper():
    print("[MONITORING] Starting wav helper test...")
    try:
        wav_helper_url = "https://wav-helper.com"
        yt_title = "hello_im_under_the_water.m4a"

        # test handle_yt
        handle_yt_data = {
            "yt_id": "SfT4FMkh1-w",
            "is_cut": "false",
            "download_mp3": "true"
        }

        handle_yt_response = requests.post(f"{wav_helper_url}/handle_yt", json=handle_yt_data, verify=False)   

        handle_yt_response_json = handle_yt_response.json()

        if handle_yt_response_json["error"] == "true":
            raise Exception(f"[ERROR]-[POST] {wav_helper_url}/handle_yt error on the server side...")
        
        get_audio_response = requests.get(f"{wav_helper_url}/audio/{yt_title}")
        
        if get_audio_response.status_code != 200:
            raise Exception(f"[ERROR]-[GET] {wav_helper_url}/audio/{yt_title} error on the server side...")
    except:
        print("[MONITORING] check_wav_helper test EXCEPTION OCCURRED!!!!!")
        traceback.print_exc()

        sns.publish(
            TopicArn="arn:aws:sns:us-east-1:235154285215:wav-ninja-monitoring",
            Message="WAV NINJA MONITORING FAILED FOR check_wav_helper TEST PLEASE LOOK INTO IT"
        )


# def check_pytube():
#     print("[MONITORING] Starting yt-dlp download test...")
    
#     try:
#         url = "https://www.youtube.com/watch?v=oftolPu9qp4"
#         yt = YtdlpHandler(url)
#         destfilename = yt.yt_dlp_request(True)["destfilename"]
#         os.remove(destfilename)
#         print(f"[MONITORING] successfully tested download of {destfilename}")
#     except:
#         print("[MONITORING] yt-dlp download test EXCEPTION OCCURRED!!!!!")
#         traceback.print_exc()

#         sns.publish(
#             TopicArn="arn:aws:sns:us-east-1:235154285215:wav-ninja-monitoring",
#             Message="WAV NINJA MONITORING FAILED FOR Yt-dlp TEST PLEASE LOOK INTO IT"
#         )


def check_premium():
    webapp_url = "https://wav.ninja"      # Change url to this for dev //youtube-cutter-dev-703951066.us-east-1.elb.amazonaws.com
    ddb_helper = DynamoDbHelper(table_name="youtube-cutter-test-premium-subscribers")

    print("[MONITORING] Starting PremiumLogHandler test...")

    try:
        # First add a entry to test db
        ddb_helper.putItem(email="andre888chang@gmail.com", access_key="1234-1234-1234",timestamp="2025-02-08")

        # Test a non existent password
        bad_data = {
            "input_password": "XXXX-XXXX-XXXX",
            "testing": True
        }

        bad_data_response = requests.post("https://wav.ninja/login_premium", json=bad_data, verify=False)   
        bad_data_response_json = bad_data_response.json()
        if bad_data_response_json["authorized"] != False:
            raise Exception("Request should have returned False!")

        # Test existing password
        data = {
            "input_password": "1234-1234-1234",
            "testing": True
        }

        response = requests.post("https://wav.ninja/login_premium", json=data, verify=False)   
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

    print("[MONITORING] Starting KofiWebhookHandler test...")

    try:
        # Simulate Ko-fi webhook first monthly donation
        first_monthly_sub_data = {
            "testing": True,
            "verification_token": "c0e0c9f5-96f4-4515-80b7-4b3ab6fb46b1",
            "message_id": "dfdb9b8d-1f77-45de-a7a6-dc597b76a53c",
            "timestamp": "2025-01-31T00:00:21Z",
            "type": "Subscription",
            "is_public": True,
            "from_name": "Jo Example",
            "message": "Good luck with the integration!",
            "amount": "5.00",
            "url": "https://ko-fi.com/Home/CoffeeShop?txid=00000000-1111-2222-3333-444444444444",
            "email": "bob888chang@gmail.com",
            "currency": "USD",
            "is_subscription_payment": True,
            "is_first_subscription_payment": True,
            "kofi_transaction_id": "00000000-1111-2222-3333-444444444444",
            "shop_items": "",
            "tier_name": "",
            "shipping": ""
        }

        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        first_monthly_sub_response = requests.post(f"{webapp_url}/kofi_webhook", data=first_monthly_sub_data, headers=headers, verify=False) 

        if first_monthly_sub_response.status_code != 200:
            raise Exception("KofiWebhookHandler test request status code should have returned 200!")
        
        first_monthly_sub_get = ddb_helper.getItem(email="bob888chang@gmail.com")
        if "error" in first_monthly_sub_get:
            raise Exception("KofiWebhookHandler test request failed. Entry does not exist in the db!")
        
        # Remove added entry for cleanup
        ddb_helper.removeItem(email="bob888chang@gmail.com")
        
        print(f"[MONITORING] successfully tested KofiWebhookHandler logic")
    except:
        print("[MONITORING] KofiWebhookHandler test EXCEPTION OCCURRED!!!!!")
        traceback.print_exc()

        sns.publish(
            TopicArn="arn:aws:sns:us-east-1:235154285215:wav-ninja-monitoring",
            Message="WAV NINJA MONITORING FAILED FOR KofiWebhookHandler TEST PLEASE LOOK INTO IT"
        )


def check_ffmpeg_wasm_endpoints():
    try: 
        print("[MONITORING] Testing ffmpeg-core.js and ffmpeg-core.wasm endpoint reachability...")
        ffmpeg_core_url = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js"
        ffmpeg_wasm_url = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm"
        
        ffmpeg_core_output = requests.get(ffmpeg_core_url)
        ffmpeg_wasm_output = requests.get(ffmpeg_wasm_url)
        if ffmpeg_core_output.status_code != 200:
            raise Exception("ffmpeg-core.js request failed")
        if ffmpeg_wasm_output.status_code != 200:
            raise Exception("ffmpeg-core.wasm request failed")
        print("[MONITORING] successfully tested ffmpeg-core.js and ffmpeg-core.wasm endpoints")
    except:
        print("[MONITORING] KofiWebhookHandler test EXCEPTION OCCURRED!!!!!")
        traceback.print_exc()

        sns.publish(
            TopicArn="arn:aws:sns:us-east-1:235154285215:wav-ninja-monitoring",
            Message="WAV NINJA MONITORING FAILED FOR testing ffmpeg wasm endpoint reachability... PLEASE LOOK INTO IT"
        )


def handle(event, context):
    print("========== [MONITORING] Starting Execution ==========")
    # check_pytube()
    check_wav_helper()
    check_premium()
    check_ffmpeg_wasm_endpoints()
    print("========== [MONITORING] Ending Execution ==========")

    return {
        "statusCode": 200
    }