VPS_IP="178.156.164.80"

scp -r ~/.aws root@${VPS_IP}:/root/.aws

scp -r ../docker root@${VPS_IP}:/opt/