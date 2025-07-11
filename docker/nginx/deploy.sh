#!/bin/bash

exec > >(tee -a /var/log/container-nginx/container-nginx.log) 2>&1

apt update

apt install -y certbot python3-certbot-nginx

nginx -g "daemon off;"