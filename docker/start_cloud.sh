#!/bin/bash

# Hetzner vps startup cron script

# Variables used in docker-compose.yml
export APP_ENV="remote"
export FFMPEG_HOST_PATH="/opt/bin"
export LETSENCRYPT_HOST_PATH="./letsencrypt"

FLOATING_IP="5.161.21.191"
PARTITION_NAME="HC_Volume_102861833" 

export PARTITION_PATH="/mnt/${PARTITION_NAME}"

if [[ ! -e "/dev/disk/by-id/scsi-0${PARTITION_NAME}" ]]; then
    echo "Required external volume not attached, waiting..."
    exit 0 
fi

if [[ ! -d "$PARTITION_PATH" ]]; then
    echo "External volume not detected, attempting to mount"
    mkdir -p "$PARTITION_PATH"
    mount -o discard,defaults "/dev/disk/by-id/scsi-0${PARTITION_NAME}" "$PARTITION_PATH"
fi

if ! ip addr show dev eth0 | grep -q "$FLOATING_IP"; then
    echo "Floating ip ${FLOATING_IP} has not been added to network interface eth0, doing so now..."
    ip addr add "$FLOATING_IP" dev eth0
fi

if [[ -d "$PARTITION_PATH" && $(docker ps -q | wc -l) == 0 ]] && ip addr show dev eth0 | grep -q "$FLOATING_IP"; then
    echo "External volume detected, floating ip added, and containers are not running yet, starting up now!"
    
    cp -r "${PARTITION_PATH}/.aws" ~/.aws

    cp -r "${PARTITION_PATH}/letsencrypt" /opt/docker/letsencrypt

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