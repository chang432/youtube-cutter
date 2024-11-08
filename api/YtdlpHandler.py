import yt_dlp

class YtdlpHandler:
    destination = None

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
        'username': 'oauth2',
        'password': '',
        'verbose': True,
        'cachedir': './'
    }

    def yt_dlp_request(self, shouldDownload=False):
        with yt_dlp.YoutubeDL(self.yt_dlp_opts) as ydl:
            output = ydl.extract_info(self.url, download=shouldDownload)
        title = output.get('title', None)
        duration = output.get('duration', None)  # Duration in seconds
        # print(video_title, video_duration)
        return { 'title':title, 'duration':duration, 'destfilename':YtdlpHandler.destination }