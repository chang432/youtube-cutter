from __future__ import unicode_literals
import youtube_dl

# set the video URL and output file name
video_url = ""

# set options for youtube_dl
ydl_opts = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'postprocessor_args': ["-ss", "00:00:30", "-to", "00:01:00"]
}


# download the audio using youtube_dl
with youtube_dl.YoutubeDL(ydl_opts) as ydl:
    ydl.download([video_url])
