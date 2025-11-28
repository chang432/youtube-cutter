import traceback
import boto3
import requests

sns = boto3.client('sns')

def check_wav_helper():
    print("[MONITORING] Starting wav helper test...")
    try:
        wav_helper_url = "https://wav-helper.com"
        yt_title = "hello_im_under_the_water.mp3"

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
    check_wav_helper()
    check_ffmpeg_wasm_endpoints()
    print("========== [MONITORING] Ending Execution ==========")

    return {
        "statusCode": 200
    }