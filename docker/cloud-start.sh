#!/bin/bash

# Hetzner vps startup cron script

PARTITION_NAME="HC_Volume_102861833"

if [[ ! -d "/mnt/${PARTITION_NAME}" ]]; then
    echo "External volume not detected, attempting to mount"
    mkdir -p "/mnt/${PARTITION_NAME}"
    mount -o discard,defaults "/dev/disk/by-id/scsi-0${PARTITION_NAME}" "/mnt/${PARTITION_NAME}"
fi

if [[ -d "/mnt/${PARTITION_NAME}" && $(docker ps -q | wc -l) == 0 ]]; then
    echo "External volume detected and containers are not running yet, starting up now!"
    
    cp -r "/mnt/${PARTITION_NAME}/.aws" ~/.aws
    cd /opt/docker
    docker-compose build
    docker-compose up -d

    echo "containers started up successfully, turning off cron..."
    crontab -l 2>/dev/null | sed '/cloud-start.sh/ s/^/#/' | crontab -
fi