import yt_dlp
import shutil
import os

class YtdlpHandler:
    destination = None
    po_token = "MlsUpByy-G3Y6RSchxvk6Z-s-ovJnBonuPBLSrzUc0wtnCYSSddMI9jc3sFSztblkaXNlm9t9yPiobVUvw0NycsKw5WjMohy95JAiDGyXGVK3SCn0QKsuLyhW-qn"  # CHANGEME

    def __init__(self, url) -> None:
        self.url = url

    def yt_dlp_monitor(d):
        YtdlpHandler.destination  = d.get('info_dict').get('_filename')
        print("FILE NAME IS: ", YtdlpHandler.destination)

    yt_dlp_opts = {
        'format': 'm4a/bestaudio/best', 
        'quiet': True, 
        'paths': {'home': '/tmp/'}, 
        'progress_hooks': [yt_dlp_monitor],
        # 'username': 'oauth2',
        # 'password': '',
        # 'extractor_args': {'youtube': 'player-client=web;po_token=web+'+po_token},
        'extractor_args': {'youtube': 'player_client=web_creator;po_token=web_creator+'+po_token},
        'cookiefile': '/tmp/cookies.txt',
        'verbose': True,
        'cachedir': '/tmp',
        'nocachedir': True,
        'ignoreerrors': True
    }

    def yt_dlp_request(self, shouldDownload=False):
        # Need to move cookies to tmp folder because that is the only area that is non read only for lambdas
        shutil.copyfile("./cookies/cookies.txt","/tmp/cookies.txt")

        with yt_dlp.YoutubeDL(self.yt_dlp_opts) as ydl:
            output = ydl.extract_info(self.url, download=shouldDownload)
        title = output.get('title', None)
        duration = output.get('duration', None)  # Duration in seconds
        # print(video_title, video_duration)
        return { 'title':title, 'duration':duration, 'destfilename':YtdlpHandler.destination }