#!/bin/bash

apt update

apt install -y certbot python3-certbot-nginx

cp ./default.conf /etc/nginx/conf.d/default.conf

nginx

certbot --nginx -d wav-helper.com