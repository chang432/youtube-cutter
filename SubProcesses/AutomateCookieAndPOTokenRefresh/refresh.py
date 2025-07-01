import boto3

PO_TOKEN = "Mls0KbfTEyFBcjQR5fJ2FCIDHLwnEu4oTkho_SHoxQ5BD0q4Ai0IkfAUDTwrDwyBDZjjbnduXIGbA1hJw84LHPXGPG3WMJfuhiJwgHb3Wci-PaDy1Tyt16oTm8Ur" # CHANGE THIS

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
