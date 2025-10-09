from botocore.parsers import LOG
import yt_dlp
import os
from Logger import Logger

PID = os.getpid()
LOGGER = Logger(PID, "DEFAULT")

class YtdlpHandler:
    destination = None

    def __init__(self, url, cookies_manager) -> None:
        self.url = url
        self.yt_id = url.split("watch?v=")[-1]
        self.cookies_manager = cookies_manager
        self.cookie_path = self.cookies_manager.retrieve_valid_cookie_path()

        LOGGER.set_yt_id(self.yt_id)


    def yt_dlp_monitor(self, d):
        YtdlpHandler.destination = d.get('info_dict').get('_filename')

    def yt_dlp_request(self, shouldDownload=False):
        LOGGER.yt_log(f"Attempting to download using cookie {self.cookie_path}")

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

        try:
            with yt_dlp.YoutubeDL(yt_dlp_opts) as ydl:
                output = ydl.extract_info(self.url, download=shouldDownload)

                title = output.get('title', None)
                duration = output.get('duration', None)  # Duration in seconds
        except Exception as e:
            LOGGER.yt_log(f"yt_dlp_request failed, disabling cookie {os.path.basename(self.cookie_path)} in cookies_status.json: {e}")
            self.cookies_manager.disable_cookie(os.path.basename(self.cookie_path))
            raise e
        
        if shouldDownload:
            LOGGER.yt_log(f"yt_dlp_request complete, destination -> {YtdlpHandler.destination}")

        return { 'title':title, 'duration':duration, 'destfilepath':YtdlpHandler.destination }