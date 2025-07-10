#!/bin/bash

# Download dependencies
apt update
apt install -y vim
apt install -y curl

# Start server
gunicorn -w 4 -k gevent -b 0.0.0.0:8000 wsgi:app