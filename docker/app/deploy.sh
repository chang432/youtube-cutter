# Download dependencies
apt update
apt install -y vim
apt install -y curl
apt install -y xz-utils
apt-get -o DPkg::Options::="--force-confnew" -y install nginx

mkdir /opt/audio

# Pull down ffmpeg executable
FFMPEG_PKG_NAME="ffmpeg-master-latest-linux64-gpl"
curl -L -o "${FFMPEG_PKG_NAME}.tar.xz" https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz

tar -xf "${FFMPEG_PKG_NAME}.tar.xz"

mkdir /opt/bin

mv "${FFMPEG_PKG_NAME}/bin/ffmpeg" "/opt/bin/"

rm -rf ${FFMPEG_PKG_NAME}
rm -f "${FFMPEG_PKG_NAME}.tar.xz"

# Start server
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app