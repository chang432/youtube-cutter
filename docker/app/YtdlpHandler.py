from botocore.parsers import LOG
import yt_dlp
import os
from Logger import Logger

PID = os.getpid()
LOGGER = Logger(PID, "DEFAULT")

class YtdlpHandler:
    destination = None

    def __init__(self, url, cookie_path) -> None:
        self.url = url
        self.yt_id = url.split("watch?v=")[-1]
        self.cookie_path = cookie_path

        LOGGER.set_yt_id(self.yt_id)


    def yt_dlp_monitor(self, d):
        YtdlpHandler.destination = d.get('info_dict').get('_filename')

    def yt_dlp_request(self, shouldDownload=False):
        LOGGER.log(f"Attempting to download using cookie {self.cookie_path}")

        yt_dlp_opts = {
            'format': 'm4a/bestaudio/best', 
            'quiet': True, 
            'paths': {'home': '/audio/'}, 
            'outtmpl': f'{self.yt_id}.m4a',
            'progress_hooks': [self.yt_dlp_monitor],
            # 'extractor_args': {'youtube': 'player_client=web_creator;po_token=web_creator+'+self.po_token},
            'extractor_args': {'youtube': 'player_client=web_creator'},
            # 'extractor_args': {'youtube': 'player_client=web_embedded,web,tv'},
            'cookiefile': self.cookie_path,
            'verbose': False,
            'cachedir': '/tmp',
            'nocachedir': True,
            'ignoreerrors': True
        }

        with yt_dlp.YoutubeDL(yt_dlp_opts) as ydl:
            output = ydl.extract_info(self.url, download=shouldDownload)
        title = output.get('title', None)
        duration = output.get('duration', None)  # Duration in seconds

        if shouldDownload:
            LOGGER.log(f"yt_dlp_request complete, destination -> {YtdlpHandler.destination}")

        return { 'title':title, 'duration':duration, 'destfilepath':YtdlpHandler.destination }