# from __future__ import unicode_literals
# import youtube_dl

# # set the video URL and output file name
# video_url = ""

# # set options for youtube_dl
# ydl_opts = {
#     'format': 'bestaudio/best',
#     'postprocessors': [{
#         'key': 'FFmpegExtractAudio',
#         'preferredcodec': 'mp3',
#         'preferredquality': '192',
#     }],
#     'postprocessor_args': ["-ss", "00:00:30", "-to", "00:01:00"]
# }


# # download the audio using youtube_dl
# with youtube_dl.YoutubeDL(ydl_opts) as ydl:
#     ydl.download([video_url])


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