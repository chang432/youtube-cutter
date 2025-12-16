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

# Update s3 metrics
# Configurable variables
S3_BUCKET="youtube-cutter-hetzner-vps"
LOCAL_DIR="${PARTITION_PATH}/log/metrics"
YEAR=$(date +%Y)
MONTH=$(date +%m)
S3_FILE="${YEAR}_${MONTH}.log"
TMP_FILE="/tmp/${S3_FILE}"
S3_PATH="s3://${S3_BUCKET}/metrics/${S3_FILE}"

# Step 1: Try to download the existing log file from S3 (if exists)
echo "Attempting to download existing S3 log file: $S3_PATH"
if aws s3 cp "$S3_PATH" "$TMP_FILE"; then
    echo "Downloaded existing file to $TMP_FILE"
else
    echo "No existing file found, creating new: $TMP_FILE"
    > "$TMP_FILE"  # Create an empty file
fi

# Step 2: Append contents of all local *.log files to the temp file
echo "Appending all .log files from $LOCAL_DIR to $TMP_FILE"
for file in "$LOCAL_DIR"/*.log; do
    [ -e "$file" ] || continue  # skip if no matches
    echo "Adding $file"
    cat "$file" >> "$TMP_FILE"
done

# Step 3: Upload the combined file back to S3
echo "Uploading merged file to S3: $S3_PATH"
aws s3 cp "$TMP_FILE" "$S3_PATH"

echo "Current line count: $(wc -l < $TMP_FILE)"

# Clean up
rm -f "$TMP_FILE"

for file in "$LOCAL_DIR"/*.log; do
    [ -e "$file" ] || continue  # skip if no matches
    echo "Cleaning up $file"
    rm -f "$file"
done