#!/bin/bash

# Script to deploy youtube downloader containers locally (For amd based architecture systems bc needs a diff ffmpeg)

# Variables used in docker-compose.yml
export TEMP_DIR="/Users/andrechang/TEMP"   # CHANGE ME to desired location 
export APP_ENV="local"
export AUDIO_HOST_PATH="${TEMP_DIR}/audio"   
export FFMPEG_HOST_PATH="${TEMP_DIR}/bin"  

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
    echo "${FFMPEG_HOST_PATH}/ffmpeg does not exist, pulling down..."

    FFMPEG_PKG_NAME="ffmpeg-git-arm64-static.tar.xz"
    curl -L -o "${FFMPEG_HOST_PATH}/${FFMPEG_PKG_NAME}.tar.xz" https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-arm64-static.tar.xz
    # the below one only works with x86 architecture and i'm using M1 Mac which is amd64 :(
    # curl -L -o "${FFMPEG_HOST_PATH}/${FFMPEG_PKG_NAME}.tar.xz" https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz

    tar -xf "${FFMPEG_HOST_PATH}/${FFMPEG_PKG_NAME}.tar.xz"

    mv "${FFMPEG_HOST_PATH}/${FFMPEG_PKG_NAME}/ffmpeg" "${FFMPEG_HOST_PATH}/"

    rm -rf "${FFMPEG_HOST_PATH}/${FFMPEG_PKG_NAME}"
    rm -f "${FFMPEG_HOST_PATH}/${FFMPEG_PKG_NAME}.tar.xz"
fi

docker-compose down
docker-compose build
docker-compose up -d
