#!/bin/bash

echo "========== $(date) STARTING COOKIE UPDATER =========="

cd /opt/docker/app

python3 cookies_updater.py

echo "========== $(date) COOKIE UPDATER FINISHED =========="