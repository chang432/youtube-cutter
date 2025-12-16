# Deploys the monitoring stack to aws

# Requirements:
# - aws cli with correct profile

root_path=$(git rev-parse --show-toplevel)
monitoring_path="${root_path}/SubProcesses/Monitoring"

if [[ "$1" != "--upload-deps" && "$1" != "--upload-main" && "$1" != "--upload-all" && "$1" != "--deploy-template" ]]; then
    echo "Usage: deploy_monitoring.sh [--upload-deps | --upload-main | --upload-all | --deploy-template]"
    exit 1
fi

upload_dependencies() {
    rm -rf "${monitoring_path}/MonitoringLambda/layer-staging"  # make sure old staging folder does not exist
    mkdir -p "${monitoring_path}/MonitoringLambda/layer-staging/python/lib"  # create new layer staging folder

    rsync -r --exclude "boto3" --exclude "botocore" "${root_path}/venv/lib/" "${monitoring_path}/MonitoringLambda/layer-staging/python/lib/"

    cd "${monitoring_path}/MonitoringLambda/layer-staging"

    zip -r monitoring-dep-layer.zip .

    echo "publishing new layer version..."

    aws lambda publish-layer-version --layer-name "YoutubeCutterProdMonitoringLambdaLayer" --zip-file "fileb://${monitoring_path}/MonitoringLambda/layer-staging/monitoring-dep-layer.zip" --compatible-runtimes "python3.9"

    cd "${monitoring_path}"

    rm -rf "${monitoring_path}/MonitoringLambda/layer-staging"  # remove staging folder
}

upload_main() {
    rm -rf "${monitoring_path}/MonitoringLambda/staging"  # make sure old staging folder does not exist
    mkdir "${monitoring_path}/MonitoringLambda/staging"  # create new staging folder

    # Copy the lambda code/dependencies to the staging folder
    cp "${monitoring_path}/MonitoringLambda/monitoring.py" "${monitoring_path}/MonitoringLambda/staging/monitoring.py"

    find "${monitoring_path}/MonitoringLambda/staging/api" -type f \( -name '*.py' \) -exec sed -i '' 's/youtube-cutter-static-files-dev/youtube-cutter-static-files-prod/g' {} +
    find "${monitoring_path}/MonitoringLambda/staging/api" -type f \( -name '*.py' \) -exec sed -i '' 's/youtube-cutter-private-dev/youtube-cutter-private-prod/g' {} +
    find "${monitoring_path}/MonitoringLambda/staging/api" -type f \( -name '*.py' \) -exec sed -i '' 's/youtube-cutter-dev-po-token/youtube-cutter-prod-po-token/g' {} +
    find "${monitoring_path}/MonitoringLambda/staging/api" -type f \( -name '*.py' \) -exec sed -i '' 's/youtube-cutter-dev-premium-subscribers/youtube-cutter-prod-premium-subscribers/g' {} +

    cd "${monitoring_path}/MonitoringLambda/staging"

    zip -r monitoring.zip .

    aws lambda update-function-code --function-name "YoutubeCutterProdMonitoring" --zip-file "fileb://monitoring.zip"

    cd "${monitoring_path}"

    rm -rf "${monitoring_path}/MonitoringLambda/staging"  # remove old staging folder
}

wait_for_stack() {
    while true; do
        STACK_NAME="youtube-cutter-monitoring-stack"
        CHECK_INTERVAL="10"

        # Get the current stack status
        STACK_STATUS=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" \
            --query "Stacks[0].StackStatus" --output text 2>/dev/null)

        if [[ -z "$STACK_STATUS" ]]; then
            echo "Error: Stack '$STACK_NAME' not found!"
            exit 1
        fi

        echo "Current status: $STACK_STATUS"

        # Check if the stack has successfully completed
        if [[ "$STACK_STATUS" == "CREATE_COMPLETE" || "$STACK_STATUS" == "UPDATE_COMPLETE" ]]; then
            echo "✅ Stack '$STACK_NAME' completed successfully!"
            break
        fi

        # Check if the stack failed
        if [[ "$STACK_STATUS" == "ROLLBACK_COMPLETE" || "$STACK_STATUS" == "DELETE_FAILED" || "$STACK_STATUS" == "CREATE_FAILED" ]]; then
            echo "❌ Stack deployment failed with status: $STACK_STATUS"
            exit 1
        fi

        # Wait before checking again
        echo "⏳ Waiting for $CHECK_INTERVAL seconds..."
        sleep $CHECK_INTERVAL
    done
}

# If first deployment, will upload dummy dependency layer zip to s3 so that the resource can be created with cfn. It will later be replaced with the real dependencies. 
# Also always updates lambda code to replace the default dummy lambda code deployed with cfn.
if [[ "$1" == "--deploy-template" ]]; then
    stackExist=$(aws cloudformation describe-stacks --stack-name="youtube-cutter-monitoring-stack" --query "Stacks[0].StackId" --output text 2>/dev/null)
    if [[ -z "$stackExist" ]]; then
        echo "Stack does not exist, uploading dummy dep layer zip"
        mkdir -p temp/python/lib/python3.9/site-packages
        echo "dummy lib contents" > temp/python/lib/python3.9/site-packages/test.txt
        cd temp
        zip -r monitoring-dep-layer.zip .
        mv monitoring-dep-layer.zip ../
        cd ..
        rm -rf temp
        aws s3 cp monitoring-dep-layer.zip s3://youtube-cutter-private-prod/monitoring-dep-layer.zip
        rm -f monitoring-dep-layer.zip

        aws cloudformation create-stack --stack-name "youtube-cutter-monitoring-stack" --template-body file://monitoring-cfn.yaml --capabilities CAPABILITY_NAMED_IAM
    else
        aws cloudformation update-stack --stack-name "youtube-cutter-monitoring-stack" --template-body file://monitoring-cfn.yaml --capabilities CAPABILITY_NAMED_IAM
    fi
    wait_for_stack
    upload_main

    if [[ -z "$stackExist" ]]; then
        echo "Stack does not exist, updating dependency layer with real dependencies"
        upload_dependencies
    fi
fi

if [[ "$1" == "--upload-deps" || "$1" == "--upload-all" ]]; then
    upload_dependencies
fi

if [[ "$1" == "--upload-main" || "$1" == "--upload-all" ]]; then
    upload_main
fi
