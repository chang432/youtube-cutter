from pytube import YouTube
import os
import traceback
import boto3

def check_pytube():
    print("[MONITORING] Starting Execution ")
    try:
        url = "https://www.youtube.com/watch?v=oftolPu9qp4"
        yt = YouTube(url, use_oauth=False, allow_oauth_cache=False)
        audio = yt.streams.filter(only_audio=True).first()
        out_file = audio.download(output_path="/tmp/")
        os.remove(out_file)
        print(f"[MONITORING] successfully tested download of {out_file}")
    except:
        print("[MONITORING] EXCEPTION OCCURRED!!!!!")
        traceback.print_exc()
        os.system('aws sns publish --message "WAV NINJA MONITORING HAS FAILED PLEASE LOOK INTO IT" --topic-arn "arn:aws:sns:us-east-1:235154285215:wav-ninja-monitoring"')

        sns = boto3.client('sns')
        sns.publish(
            TopicArn="arn:aws:sns:us-east-1:235154285215:wav-ninja-monitoring",
            Message="WAV NINJA MONITORING HAS FAILED PLEASE LOOK INTO IT"
        )