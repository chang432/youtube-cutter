#!/bin/bash

# Hetzner vps startup cron script

# Variables used in docker-compose.yml
export APP_ENV="remote"
export FFMPEG_HOST_PATH="/opt/bin"

PARTITION_NAME="HC_Volume_102861833" 
FLOATING_IP="5.161.21.191"

if [[ ! -d "/mnt/${PARTITION_NAME}" ]]; then
    echo "External volume not detected, attempting to mount"
    mkdir -p "/mnt/${PARTITION_NAME}"
    mount -o discard,defaults "/dev/disk/by-id/scsi-0${PARTITION_NAME}" "/mnt/${PARTITION_NAME}"
fi

if ! ip addr show dev eth0 | grep -q "$FLOATING_IP"; then
    echo "Floating ip ${FLOATING_IP} has not been added to network interface eth0, doing so now..."
    ip addr add "$FLOATING_IP" dev eth0
fi

if [[ -d "/mnt/${PARTITION_NAME}" && $(docker ps -q | wc -l) == 0 ]] && ip addr show dev eth0 | grep -q "$FLOATING_IP"; then
    echo "External volume detected, floating ip added, and containers are not running yet, starting up now!"
    
    cp -r "/mnt/${PARTITION_NAME}/.aws" ~/.aws

    cp -r "/mnt/${PARTITION_NAME}/letsencrypt" /opt/docker/letsencrypt

    if [[ ! -f "${FFMPEG_HOST_PATH}/ffmpeg" ]]; then
        # Pull down ffmpeg executable
        # Source location: https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz
        echo "Pulling down ffmpeg executable"

        aws s3 cp "s3://youtube-cutter-hetzner-vps/ffmpeg-master-latest-linux64-gpl/ffmpeg" "${FFMPEG_HOST_PATH}/"
        chmod +x "${FFMPEG_HOST_PATH}/ffmpeg"
    fi

    cd /opt/docker
    docker-compose down
    docker-compose build
    docker-compose up -d

    echo "containers started up successfully, turning off cron..."
    crontab -l 2>/dev/null | sed '/start_cloud.sh/ s/^/#/' | crontab -
fi