from flask import Flask
from flask_restful import Api
# from flask_cors import CORS
from FullDownloadHandler import FullDownloadHandler
from CleanupHandler import CleanupHandler
from flask_jwt_extended import JWTManager
import boto3

app = Flask(__name__)
# CORS(app, origins=["http://127.0.0.1:5000", "https://wav.ninja", "https://youtube-cutter-dev-1942500617.us-east-1.elb.amazonaws.com"])
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token_cookie"
app.config["JWT_COOKIE_CSRF_PROTECT"] = True
app.config["JWT_ACCESS_CSRF_HEADER_NAME"] = "X-CSRF-TOKEN"

ssm_client = boto3.client("ssm")

param_output = ssm_client.get_parameter(
    Name="youtube-cutter-premium-jwt-key",
    WithDecryption=True
)

jwt_secret_key = param_output["Parameter"]["Value"]
app.config["JWT_SECRET_KEY"] = jwt_secret_key

jwt = JWTManager(app)

api = Api(app)
api.add_resource(FullDownloadHandler, "/handle_yt")
api.add_resource(CleanupHandler, "/cleanup")