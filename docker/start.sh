#!/bin/bash

# Hetzner vps startup cron script

PARTITION_NAME="HC_Volume_102861833"

if [[ -d "/mnt/${PARTITION_NAME}" && $(docker ps -q | wc -l) == 0 ]]; then
        echo "external partition detected and containers are not running yet, starting up now!"
        
        cp -r "/mnt/${PARTITION_NAME}/.aws" ~/.aws
        cd /opt/docker
        docker-compose build
        docker-compose up -d
fi