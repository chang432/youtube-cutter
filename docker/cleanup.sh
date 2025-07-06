# Script made to run on cron to clean up any audio files older than X minutes

AUDIO_PATH="/audio"

CURRENT_EPOCH_TIME=$(date +%s)
TTL_SEC=300  # 5 minutes

echo "[cleanup.sh] Starting cleanup of files in ${AUDIO_PATH} older than ${TTL_SEC} seconds..."

echo "Current epoch time: ${CURRENT_EPOCH_TIME}"

for file in ${AUDIO_PATH}/*; do
    if [[ -f "$file" ]]; then
        file_epoch=$(stat -c %Y $file)
        echo "${file} -> ${file_epoch}"
        epoch_diff=$(( $CURRENT_EPOCH_TIME - $file_epoch ))
        if [[ $epoch_diff -gt ${TTL_SEC} ]]; then
            echo "${file} is expired, removing..."
            rm -f ${file}
        fi
    fi
done

echo "======================================="
