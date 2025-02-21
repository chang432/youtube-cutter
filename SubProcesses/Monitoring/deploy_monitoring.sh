# Deploys the monitoring stack to aws

# Requirements:
# - aws cli with correct profile

root_path=$(git rev-parse --show-toplevel)
monitoring_path="${root_path}/SubProcesses/Monitoring"

if [[ "$1" != "--upload-deps" && "$1" != "--upload-main" && "$1" != "--upload-all" ]]; then
    echo "Usage: deploy_monitoring.sh [--upload-deps | --upload-main | --upload-all]"
    exit 1
fi

if [[ "$1" == "--upload-deps" || "$1" == "--upload-all" ]]; then
    rm -rf "${monitoring_path}/MonitoringLambda/layer-staging"  # remove old layer staging folder

    mkdir -p "${monitoring_path}/MonitoringLambda/layer-staging/python/lib"  # create new layer staging folder

    rsync -r --exclude "boto3" --exclude "botocore" "${root_path}/venv/lib/" "${monitoring_path}/MonitoringLambda/layer-staging/python/lib/"

    cd "${monitoring_path}/MonitoringLambda/layer-staging"

    zip -r monitoring-dep-layer.zip .

    aws lambda publish-layer-version --layer-name "YoutubeCutterProdMonitoringLambdaLayer" --zip-file "fileb://${monitoring_path}/MonitoringLambda/layer-staging/monitoring-dep-layer.zip" --compatible-runtimes "python3.9"

    cd "${monitoring_path}"
fi

if [[ "$1" == "--upload-main" || "$1" == "--upload-all" ]]; then
    rm -rf "${monitoring_path}/MonitoringLambda/staging"  # remove old staging folder

    mkdir "${monitoring_path}/MonitoringLambda/staging"  # create new staging folder

    # Copy the lambda code/dependencies to the staging folder
    cp "${monitoring_path}/MonitoringLambda/monitoring.py" "${monitoring_path}/MonitoringLambda/staging/monitoring.py"

    cp -r "${root_path}/api" "${monitoring_path}/MonitoringLambda/staging/api"

    sed -i '' "s/BUCKET_NAME/${BUCKET_NAME}/g" "${monitoring_path}/MonitoringLambda/staging/monitoring.py"

    find "${monitoring_path}/MonitoringLambda/staging/api" -type f \( -name '*.py' \) -exec sed -i '' 's/youtube-cutter-static-files-dev/youtube-cutter-static-files-prod/g' {} +
    find "${monitoring_path}/MonitoringLambda/staging/api" -type f \( -name '*.py' \) -exec sed -i '' 's/youtube-cutter-private-dev/youtube-cutter-private-prod/g' {} +
    find "${monitoring_path}/MonitoringLambda/staging/api" -type f \( -name '*.py' \) -exec sed -i '' 's/youtube-cutter-dev-po-token/youtube-cutter-prod-po-token/g' {} +
    find "${monitoring_path}/MonitoringLambda/staging/api" -type f \( -name '*.py' \) -exec sed -i '' 's/youtube-cutter-dev-premium-subscribers/youtube-cutter-prod-premium-subscribers/g' {} +

    cd "${monitoring_path}/MonitoringLambda/staging"

    zip -r monitoring.zip .

    aws lambda update-function-code --function-name "YoutubeCutterProdMonitoring" --zip-file "fileb://monitoring.zip"

    cd "${monitoring_path}"
fi


