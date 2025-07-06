#!/bin/bash

# Hetzner vps startup cron script

if [[ -d "/mnt/HC_Volume_102861833" && $(docker ps -q | wc -l) == 0 ]]; then
        echo "external partition detected and containers are not running yet, starting up now!"
        cd /opt/docker
        docker-compose build
        docker-compose up -d
fi