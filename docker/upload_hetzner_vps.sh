VPS_IP="178.156.164.80"

scp -r -i ~/.ssh/id_ed25519 ~/.aws root@${VPS_IP}:/root/.aws

scp -r -i ~/.ssh/id_ed25519 ../docker root@${VPS_IP}:/opt/