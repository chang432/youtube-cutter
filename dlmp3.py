import yt_dlp

URLS = ['https://www.youtube.com/watch?v=F35291LbOMM']

ydl_opts = {
    'format': 'mp3/bestaudio/best',
    # ℹ️ See help(yt_dlp.postprocessor) for a list of available Postprocessors and their arguments
    'postprocessors': [{  # Extract audio using ffmpeg
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
    }],
    'postprocessor_args': ["-ss", "00:00:30", "-to", "00:01:00"]
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    error_code = ydl.download(URLS)

