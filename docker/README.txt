To run containers locally:

- "bash start_local.sh"



To run containers on Hetzner VPS:

- Go on console.hetzner.com and click add server

- Use Ubuntu image, make sure volume with aws credentials is attached, and paste code from hetzner_cloud_init.yml into the Cloud Config block

- Wait a while for the setup to finish (startup logs are in /var/log/cloud-init-output.log and /var/log/start.log)



To restart containers on an existing VPS:

- cd to "/opt/docker" and run "docker-compose down"

- open cron ("crontab -e") and uncomment out the cron job running start_cloud.sh

- wait for the startup script to run (the cron job disable itself automatically after startup is done)


=====================
General:
- If floating public ip changes, update the following regions:
-- frontend/src/App.jsx
-- docker/start_cloud.sh