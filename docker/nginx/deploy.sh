#!/bin/bash

apt update

apt install -y certbot python3-certbot-nginx

cp ./default.conf /etc/nginx/conf.d/default.conf

certbot install --cert-name wav-helper.com

nginx -s stop

nginx -g "daemon off;"