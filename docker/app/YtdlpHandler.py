from botocore.parsers import LOG
import yt_dlp
import os
from Logger import Logger

PID = os.getpid()

class YtdlpHandler:
    destination = None

    def __init__(self, url, cookies_manager, cookie_path) -> None:
        self.url = url
        self.yt_id = url.split("watch?v=")[-1]
        self.cookies_manager = cookies_manager
        self.cookie_path = cookie_path

    def yt_dlp_monitor(self, d):
        YtdlpHandler.destination = d.get('info_dict').get('_filename')

    def yt_dlp_request(self, shouldDownload=False):
        Logger.log(f"Attempting to download using cookie {self.cookie_path}", PID, self.yt_id)

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
            Logger.log(f"yt_dlp_request failed, finding a new cookie to use: {e}", PID, self.yt_id)
            # self.cookies_manager.disable_cookie(os.path.basename(self.cookie_path))
            raise e
        
        if shouldDownload:
            Logger.log(f"yt_dlp_request complete, destination -> {YtdlpHandler.destination}", PID, self.yt_id)

        return { 'title':title, 'duration':duration, 'destfilepath':YtdlpHandler.destination }