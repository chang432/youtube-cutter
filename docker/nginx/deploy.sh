#!/bin/bash

exec > >(tee -a /var/log/container-nginx/container-nginx.log) 2>&1

apt update

apt install -y certbot python3-certbot-nginx

cp /opt/nginx.conf /etc/nginx/nginx.conf

nginx -g "daemon off;"