import boto3

# Getting auth token stored in ssm which is updated by refresh_access_token.py 
ssm_parameter_name = "youtube.auth.token"
ssm_client = boto3.client("ssm")
response = ssm_client.get_parameter(Name=ssm_parameter_name, WithDecryption=True)

# print(response["Parameter"]["Value"])

with open("./test.txt", "w") as file:
    file.write(response["Parameter"]["Value"])