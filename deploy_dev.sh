#!/bin/bash
# run from root dir

load_balancer="youtube-cutter-dev-1470211170.us-east-1.elb.amazonaws.com"    # CHANGE EVERY REDEPLOY

sed 's/os\.environ\["IS_DEPLOYMENT"] = "FALSE"/os\.environ["IS_DEPLOYMENT"] = "TRUE"/' app.py > prod_app.py

mv app.py dev_app.py
mv prod_app.py app.py

cd frontend

npm run build

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' "s/\/assets/https:\/\/youtube-cutter-static-files-dev.s3.amazonaws.com\/assets/g" {} +

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' "s|http://127.0.0.1:5000|https://${load_balancer}|g" {} +

cd ../scripts

python upload_static.py

cd ..

# zappa deploy dev
zappa update dev

cd frontend

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' 's/https:\/\/youtube-cutter-static-files-dev.s3.amazonaws.com\/assets/\/assets/g' {} +

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' "s|https://${load_balancer}|http://127.0.0.1:5000|g" {} +

cd ..

mv dev_app.py app.py

# zappa tail dev