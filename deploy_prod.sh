#!/bin/bash
# run from root dir

sed 's/os\.environ\["IS_DEPLOYMENT"] = "FALSE"/os\.environ["IS_DEPLOYMENT"] = "TRUE"/' app.py > prod_app.py

mv app.py dev_app.py
mv prod_app.py app.py

# change bucket name
find api -type f \( -name '*.py' \) -exec sed -i '' 's/youtube-cutter-static-files-dev/youtube-cutter-static-files-prod/g' {} +
sed -i '' 's/youtube-cutter-static-files-dev/youtube-cutter-static-files-prod/g' app.py
sed -i '' 's/youtube-cutter-static-files-dev/youtube-cutter-static-files-prod/g' scripts/upload_static.py

cd frontend

npm run build

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' 's/\/assets/https:\/\/youtube-cutter-static-files-prod.s3.amazonaws.com\/assets/g' {} +

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' 's/http:\/\/127.0.0.1:5000/https:\/\/wav.ninja/g' {} +

cd ../scripts

python upload_static.py

cd ..

# zappa package prod
zappa deploy prod

# REVERT STUFF NOW

# change back bucket name
find api -type f \( -name '*.py' \) -exec sed -i '' 's/youtube-cutter-static-files-prod/youtube-cutter-static-files-dev/g' {} +
sed -i '' 's/youtube-cutter-static-files-prod/youtube-cutter-static-files-dev/g' app.py
sed -i '' 's/youtube-cutter-static-files-prod/youtube-cutter-static-files-dev/g' scripts/upload_static.py

cd frontend

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' 's/https:\/\/youtube-cutter-static-files-prod.s3.amazonaws.com\/assets/\/assets/g' {} +

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' 's/https:\/\/wav.ninja/http:\/\/127.0.0.1:5000/g' {} +

cd ..

mv dev_app.py app.py

# zappa tail prod