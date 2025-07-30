#!/bin/bash

exec > >(tee -a /var/log/container-flask/container-flask.log) 2>&1

# Download dependencies
apt update
apt install -y vim
apt install -y curl

# Start server
gunicorn -w 4 --timeout 180 -b 0.0.0.0:8000 wsgi:app