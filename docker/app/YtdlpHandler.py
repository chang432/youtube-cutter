import yt_dlp
import boto3
import os
from datetime import datetime, timedelta

BUCKET_NAME = "youtube-cutter-hetzner-vps"
COOKIES_KEY = "yt-credentials/cookies.txt"

class YtdlpHandler:
    destination = None

    def __init__(self, url) -> None:
        s3_client = boto3.client("s3")

        self.url = url

        last_downloaded = datetime.now() - timedelta(days=60)  # Default to always download cookie if no datetime file exists
        if os.path.exists("/tmp/last_downloaded_cookies.txt"):
            with open("/tmp/last_downloaded_cookies.txt", "r") as last_downloaded_file:
                last_downloaded = datetime.strptime(last_downloaded_file.read().strip(), "%Y-%m-%d %H:%M:%S.%f")

        try:
            s3_client.get_object(
                Bucket=BUCKET_NAME,
                Key=COOKIES_KEY,
                IfModifiedSince=last_downloaded
            )

            s3_client.download_file(
                Bucket=BUCKET_NAME,
                Key=COOKIES_KEY,
                Filename="/tmp/cookies.txt"
            )

            with open("/tmp/last_downloaded_cookies.txt", "w") as last_downloaded_file:
                last_downloaded_file.write(str(datetime.now()))

            print("[CUSTOM] cookies.txt modified, downloading new version.")
        except s3_client.exceptions.ClientError as e:
            if e.response['Error']['Code'] == '304':
                print("[CUSTOM] cookies.txt has not been modified, using cached version.")
            else:
                raise


    def yt_dlp_monitor(self, d):
        YtdlpHandler.destination  = d.get('info_dict').get('_filename')
        print("FILE NAME IS: ", YtdlpHandler.destination)

    def yt_dlp_request(self, shouldDownload=False):

        yt_dlp_opts = {
            'format': 'm4a/bestaudio/best', 
            'quiet': True, 
            'paths': {'home': '/tmp/'}, 
            'progress_hooks': [self.yt_dlp_monitor],
            # 'extractor_args': {'youtube': 'player_client=web_creator;po_token=web_creator+'+self.po_token},
            'extractor_args': {'youtube': 'player_client=web_creator'},
            'cookiefile': '/tmp/cookies.txt',
            'verbose': False,
            'cachedir': '/tmp',
            'nocachedir': True,
            'ignoreerrors': True
        }

        with yt_dlp.YoutubeDL(yt_dlp_opts) as ydl:
            output = ydl.extract_info(self.url, download=shouldDownload)
        title = output.get('title', None)
        duration = output.get('duration', None)  # Duration in seconds
        # print(video_title, video_duration)
        return { 'title':title, 'duration':duration, 'destfilename':YtdlpHandler.destination }