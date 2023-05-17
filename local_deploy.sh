#!/bin/bash
# run from root dir

cd frontend

npm run build

cd ..
 
flask run

