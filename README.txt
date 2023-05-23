Development Environment Instructions

Setup: 
- pip install -r requirements.txt
- Note: ffmpeg 4.1.3 for macos is automatically tracked in "binaries/ffmpeg".

(IN ROOT DIR)
to test app locally: "bash local_deploy.sh"
update app remotely: "bash deploy.sh" 

-------

Helper Scripts Detail: 

"bash local_deploy.sh" 
The above command (in root dir) will:
- build react files
- run local flask app

"bash deploy.sh" 
The above command (in root dir) will:
- build react files
- replace static file refs with s3 urls
- replace localhost urls with web url
- upload static files to s3
- update lambda
- re-configure built files to use local refs

---------


