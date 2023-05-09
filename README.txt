Development Environment Instructions

pip install -r requirements.txt

to test app locally: "flask run"
update app remotely: "zappa update" 

-------
Frontend Instructions:

cd frontend
npm install
npm run dev

./build.sh (in root dir, this builds frontend files and adds s3 static files references as well as uploads the static files to s3) 