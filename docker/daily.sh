#!/bin/bash

# Configure PARTITION_PATH var set in start_cloud.sh
source /opt/shared_env.sh
echo "PARTITION_PATH: ${PARTITION_PATH}"

# Refresh cleanup.log
echo "[daily.sh] Refreshing cleanup.log..."
echo "" > /var/logs/cleanup.log

# Archive container logs
echo "Attempting to archive container logs..."
if [[ -d "$PARTITION_PATH" ]]; then 
    ARCHIVE_NAME_FLASK="container-flask_$(date +'%Y_%m_%d').log.gz"
    ARCHIVE_NAME_NGINX="container-nginx_$(date +'%Y_%m_%d').log.gz"

    gzip -c "${PARTITION_PATH}/log/container-flask/container-flask.log" > "${PARTITION_PATH}/log/${ARCHIVE_NAME_FLASK}"
    gzip -c "${PARTITION_PATH}/log/container-nginx/container-nginx.log" > "${PARTITION_PATH}/log/${ARCHIVE_NAME_NGINX}"

    echo "" > "${PARTITION_PATH}/log/container-flask/container-flask.log"
    echo "" > "${PARTITION_PATH}/log/container-nginx/container-nginx.log"

    echo "[daily.sh] Archive complete!"
else
    echo "[ERROR] Cannot archive container logs because PARTITION_PATH is not set or path does not exist"
fi