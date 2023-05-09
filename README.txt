Development Environment Instructions

pip install -r requirements.txt

to test app locally: "flask run"
update app remotely: "zappa update" 

-------
Frontend Instructions:

cd frontend
npm install
npm run dev

-------
"./deploy" 
The above command (in root dir) will:
- build react files
- replace static file refs with s3 urls
- replace localhost urls with web url
- upload static files to s3
- update lambda
- re-configure built files to use local refs
