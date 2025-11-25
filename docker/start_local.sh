#!/bin/bash

# Script to deploy youtube downloader containers locally (For amd based architecture systems bc needs a diff ffmpeg)

# Variables used in docker-compose.yml
export TEMP_DIR="/Users/andrechang/TEMP"   # CHANGE ME to desired location 
export APP_ENV="local"
export AUDIO_HOST_PATH="${TEMP_DIR}/audio"   
export FFMPEG_HOST_PATH="${TEMP_DIR}/bin"  
export NGINX_HOST_CONFIG_PATH="./nginx/default.local.conf"
export DENO_INSTALL_PATH="/tmp/deno_install"
export HOST_ENDPOINT="http://127.0.0.1"

mkdir -p "${TEMP_DIR}"

if [[ -d "${AUDIO_HOST_PATH}" ]]; then
    rm -rf "${AUDIO_HOST_PATH}"
fi
mkdir -p "${AUDIO_HOST_PATH}"

if [[ ! -d "${FFMPEG_HOST_PATH}" ]]; then
    rm -rf "${FFMPEG_HOST_PATH}"
fi

if [[ ! -f "${FFMPEG_HOST_PATH}/ffmpeg" ]]; then
    # Pull down ffmpeg executable (only once)
    # Source location: https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-arm64-static.tar.xz
    echo "${FFMPEG_HOST_PATH}/ffmpeg does not exist, pulling down from s3..."

    aws s3 cp "s3://youtube-cutter-hetzner-vps/ffmpeg-git-arm64-static/ffmpeg" "$FFMPEG_HOST_PATH/"
    chmod +x "${FFMPEG_HOST_PATH}/ffmpeg"
fi

if [[ ! -f "${DENO_INSTALL_PATH}/deno_install.sh" ]]; then
    mkdir -p "${DENO_INSTALL_PATH}"
    aws s3 cp "s3://youtube-cutter-hetzner-vps/deno_install.sh" "${DENO_INSTALL_PATH}/deno_install.sh"
    chmod +x "${DENO_INSTALL_PATH}/deno_install.sh"
fi

python3 app/CookiesManager.py

docker compose down
docker compose build
docker compose up -d
