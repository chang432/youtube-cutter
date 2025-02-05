import yt_dlp
import shutil
import boto3
import os

class YtdlpHandler:
    destination = None

    def __init__(self, url) -> None:
        s3_client = boto3.client("s3")
        ssm_client = boto3.client("ssm")

        self.url = url
        self.po_token = ssm_client.get_parameter(Name="youtube-cutter-dev-po-token")
        
        # Need to move cookies to tmp folder because that is the only area that is non read only for lambdas
        s3_client.download_file("youtube-cutter-private-dev", "youtube-credentials/cookies.txt", "/tmp/cookies.txt")

    def yt_dlp_monitor(self, d):
        print(d)
        YtdlpHandler.destination  = d.get('info_dict').get('_filename')
        print("FILE NAME IS: ", YtdlpHandler.destination)

    def yt_dlp_request(self, shouldDownload=False):

        yt_dlp_opts = {
            'format': 'm4a/bestaudio/best', 
            'quiet': True, 
            'paths': {'home': '/tmp/'}, 
            'progress_hooks': [self.yt_dlp_monitor],
            # 'username': 'oauth2',
            # 'password': '',
            # 'extractor_args': {'youtube': 'player-client=web;po_token=web+'+po_token},
            'extractor_args': {'youtube': 'player_client=web_creator;po_token=web_creator+'+self.po_token["Parameter"]["Value"]},
            'cookiefile': '/tmp/cookies.txt',
            'verbose': True,
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