import boto3

PO_TOKEN = "MluNKJhkuNzcsY0QJO6eQI8rdiGnB_rWr4h8sCXgH-Ug13sKeFYWNl48_H-JrR33twDnFyq0oweB0oHiJ3gv3AX_5gI49CIpQxgFh9a_bR1NxZQFIH28aZnH9YJ9" # CHANGE THIS

# Upload PO_TOKEN to SSM
ssm = boto3.client("ssm")

ssm_param = "youtube-cutter-prod-po-token"
ssm.put_parameter(
    Name=ssm_param,
    Value=PO_TOKEN,
    Type="String",
    Overwrite=True
)

# Upload cookie to S3
s3 = boto3.client("s3")

cookie_file_path = "staging/cookies.txt"
s3.upload_file(cookie_file_path, "youtube-cutter-private-prod", "youtube-credentials/cookies.txt")
