import boto3

PO_TOKEN = "MnDz81HRbhOKUvPLINjPDPEigSJB26l55wT_1cCNS_cauYeb1X7ZZUNfj9PXiLGUJs_-2RJQfsrqanITMgN_4p8GQRnC7jdot_VvrgU20e_f_dsMBG2xf4HfvB1opbQiXkigsIfR71-x_9SXF_lQ0QXU" # CHANGE THIS

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
