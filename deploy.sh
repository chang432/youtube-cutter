#!/bin/bash
# run from root dir

sed 's/os\.environ\["IS_DEPLOYMENT"] = "FALSE"/os\.environ["IS_DEPLOYMENT"] = "TRUE"/' app.py > prod_app.py

mv app.py dev_app.py
mv prod_app.py app.py

cd frontend

npm run build

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' 's/\/assets/https:\/\/youtube-cutter-static-files.s3.amazonaws.com\/assets/g' {} +

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' 's/http:\/\/127.0.0.1:5000/https:\/\/olcscf80xa.execute-api.us-east-1.amazonaws.com\/dev/g' {} +

cd ..

python upload_static.py

zappa update

cd frontend

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' 's/https:\/\/youtube-cutter-static-files.s3.amazonaws.com\/assets/\/assets/g' {} +

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' 's/https:\/\/olcscf80xa.execute-api.us-east-1.amazonaws.com\/dev/http:\/\/127.0.0.1:5000/g' {} +

cd ..

mv dev_app.py app.py

zappa tail dev