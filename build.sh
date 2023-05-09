#!/bin/bash

cd frontend

npm run build

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' 's/\/assets/https:\/\/youtube-cutter-static-files.s3.amazonaws.com\/assets/g' {} +

cd ..

python upload_static.py
