import os
import traceback
import boto3
from api.YtdlpHandler import YtdlpHandler

def check_pytube():
    print("[MONITORING] Starting Execution ")
    try:
        url = "https://www.youtube.com/watch?v=oftolPu9qp4"
        yt = YtdlpHandler(url)
        destfilename = yt.yt_dlp_request(True)["destfilename"]
        os.remove(destfilename)
        print(f"[MONITORING] successfully tested download of {destfilename}")
    except:
        print("[MONITORING] EXCEPTION OCCURRED!!!!!")
        traceback.print_exc()
        os.system('aws sns publish --message "WAV NINJA MONITORING HAS FAILED PLEASE LOOK INTO IT" --topic-arn "arn:aws:sns:us-east-1:235154285215:wav-ninja-monitoring"')

        sns = boto3.client('sns')
        sns.publish(
            TopicArn="arn:aws:sns:us-east-1:235154285215:wav-ninja-monitoring",
            Message="WAV NINJA MONITORING HAS FAILED PLEASE LOOK INTO IT"
        )