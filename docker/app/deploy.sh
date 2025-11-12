#!/bin/bash

exec > >(tee -a /var/log/container-flask/container-flask.log) 2>&1

# Download dependencies
apt update
apt install -y vim curl unzip

# Install Deno 
curl -fsSL -o /opt/deno_install.sh https://deno.land/install.sh

bash /opt/deno_install.sh -y

# Start server
gunicorn -w 4 --timeout 240 -b 0.0.0.0:8000 wsgi:app