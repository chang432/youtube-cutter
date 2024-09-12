import json
import yt_dlp

URLS = ['https://www.youtube.com/watch?v=BaW_jenozKc']

final_filename = None

def yt_dlp_monitor(d):
    global final_filename
    final_filename  = d.get('info_dict').get('_filename')
    print("FILE NAME IS: ", final_filename)
    # You could also just assign `d` here to access it and see all the data or even `print(d)` as it updates frequently

ydl_opts = {
    'format': 'm4a/bestaudio/best',
    'quiet': True,
    'paths': {'home': './testdir'},
    'progress_hooks': [yt_dlp_monitor],
    'username': 'oauth2',
    'password': '',
    'verbose': True,
    'cachedir': ''
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    # error_code = ydl.download(URLS)
    output = ydl.extract_info("https://www.youtube.com/watch?v=QrVc2jFgPEs", download=True)
    output = ydl.sanitize_info(output)
    # print(output)
    # with open("./test.log", "w") as f:
    #     f.write(output)
    #     f.close()
    video_title = output.get('title', None)
    video_duration = output.get('duration', None)  # Duration in seconds
    print(video_title, video_duration)

# def get_video_info(youtube_url):
#     # Options for yt-dlp to extract information without downloading
#     ydl_opts = {
#         'quiet': True,  # Suppress output
#         'skip_download': True,  # Do not download the video
#         'force_generic_extractor': True,  # Force using generic extractor
#     }

#     with yt_dlp.YoutubeDL(ydl_opts) as ydl:
#         # Extract information
#         info_dict = ydl.extract_info(youtube_url, download=False)
#         video_title = info_dict.get('title', None)
#         video_duration = info_dict.get('duration', None)  # Duration in seconds

#     return video_title, video_duration

# # Example usage
# youtube_url = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID'
# title, duration = get_video_info(youtube_url)
# print(f"Title: {title}")
# print(f"Duration: {duration} seconds")