#!/bin/bash

apt update

apt install -y certbot python3-certbot-nginx

nginx -g "daemon off;"