#!/bin/bash

# Hetzner vps startup cron script

# Variables used in docker-compose.yml
export APP_ENV="remote"
export FFMPEG_HOST_PATH="/opt/bin"
export LETSENCRYPT_HOST_PATH="./letsencrypt"

FLOATING_IP="5.161.21.191"
PARTITION_NAMES="HC_Volume_102861833 HC_Volume_102894653" 

export PARTITION_PATH=""

for pdir in ${PARTITION_NAMES}; do
    cur_local_path="/mnt/${pdir}"
    cur_external_path="/dev/disk/by-id/scsi-0${pdir}"

    if [[ -e "$cur_external_path" ]]; then
        echo "[${pdir}] Required external volume attached, attempting to mount..."
        mkdir -p "$cur_local_path"
        mount -o discard,defaults "$cur_external_path" "$cur_local_path"

        PARTITION_PATH="$cur_local_path"

        # set PARTITION_PATH as global env variable
        echo "export PARTITION_PATH=${PARTITION_PATH}" > /opt/shared_env.sh

        # Configure logging alias 
        echo "alias flask-logs='tail -f -n 100 /mnt/${pdir}/log/container-flask/container-flask.log'" >> ~/.bashrc
        echo "alias nginx-logs='tail -f -n 100 /mnt/${pdir}/log/container-nginx/container-nginx.log'" >> ~/.bashrc

        chmod +x /opt/shared_env.sh
        break
    fi
done

if [[ -z "$PARTITION_PATH" ]]; then
    echo "No volumes attached, waiting..."
    exit 0 
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
    docker compose down
    docker compose build
    docker compose up -d

    echo "containers started up successfully, turning off cron..."
    crontab -l 2>/dev/null | sed '/start_cloud.sh/ s/^/#/' | crontab -
fi