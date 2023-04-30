#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

DEPLOYMENT_NUMBER="$(date -u +%FT%TZ)"
echo "$DEPLOYMENT_NUMBER" > "$DIR/deployment_number"

PROJECT_NAME="$(cat "$DIR/infrastructure/variables.tf" | grep 'project_name' -A 2 | grep 'default' | cut -d '=' -f 2 | cut -d '"' -f 2)"

pushd "$DIR/backend/"
  npm run build
  pushd build
    zip -r rest_api.zip ./
    aws s3 cp ./rest_api.zip "s3://$PROJECT_NAME-backend/$DEPLOYMENT_NUMBER/"
  popd
popd

pushd "$DIR/infrastructure"
  terraform apply -auto-approve -var deployment_number="$DEPLOYMENT_NUMBER"
popd