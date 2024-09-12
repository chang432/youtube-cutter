from pytubefix import YouTube
import os

''' 
This script will ask you to sign in and generate an access token which will
be uploaded to aws ssm to be used by lambda
'''

root_path = "../"
pytube_cache_path = root_path + "/venv/lib/python3.9/site-packages/pytube/__cache__/tokens.json"

if os.path.exists(pytube_cache_path):
    print(f"{pytube_cache_path} exists, removing")
    os.remove(pytube_cache_path)
else:
    print(f"{pytube_cache_path} does not exist. No file removed.")


url = "https://www.youtube.com/watch?v=LDZX4ooRsWs&list=PL0EJuGdeigcP_mdXwU8_iSiZrT0B-4nDO"  # has to be age restricted video
yt = YouTube(url,use_oauth=True, allow_oauth_cache=True)

audio = yt.streams.filter(only_audio=True).first()
out_file = audio.download(output_path="/tmp/")

os.remove(out_file)