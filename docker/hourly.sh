#!/bin/bash

echo "========== $(date) STARTING COOKIE UPDATER =========="

cd /opt/docker/app

/opt/docker/venv/bin/python3 CookiesManager.py

echo "========== $(date) COOKIE UPDATER FINISHED =========="