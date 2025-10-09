#!/bin/bash

echo "Syncing and checking validity of cookies..."
cd /opt/docker/app
/opt/docker/venv/bin/python -c "from CookiesManager import CookiesManager; cm = CookiesManager(); cm.resync_cookies(); cm.check_cookies_validity()"
