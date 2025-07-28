from flask import Flask, render_template, request
from flask_s3 import FlaskS3
from flask_restful import Api
from flask_jwt_extended import JWTManager
from api.HelloApiHandler import HelloApiHandler
from api.FullDownloadHandler import FullDownloadHandler
from api.CleanupHandler import CleanupHandler
from api.KofiWebhookHandler import KofiWebhookHandler
from api.PremiumLoginHandler import PremiumLoginHandler
from api.PremiumVerificationHandler import PremiumVerificationHandler
import os
import boto3
import os

# env variable for local or deployment build
os.environ["IS_DEPLOYMENT"] = "FALSE"

if os.environ["IS_DEPLOYMENT"] == "FALSE": 
    from flask_cors import CORS

app = Flask(__name__, template_folder='frontend/dist', static_folder='frontend/dist/assets')

ssm_client = boto3.client("ssm")

param_output = ssm_client.get_parameter(
    Name="youtube-cutter-premium-jwt-key",
    WithDecryption=True
)

jwt_secret_key = param_output["Parameter"]["Value"]

# Configure JWT Secret Key
app.config["JWT_SECRET_KEY"] = jwt_secret_key
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]  # Store JWT in secure HTTP-only cookies
app.config["JWT_COOKIE_SECURE"] = True  # Only send cookies over HTTPS
app.config["JWT_COOKIE_HTTPONLY"] = True  # Prevent JavaScript access (XSS protection)
app.config["JWT_COOKIE_SAMESITE"] = "None"  

jwt = JWTManager(app)

if os.environ["IS_DEPLOYMENT"] == "FALSE": 
    CORS(app, supports_credentials=True)

app.config['FLASKS3_BUCKET_NAME'] = 'youtube-cutter-static-files-dev'
s3 = FlaskS3(app)
api = Api(app)

# api.add_resource(HelloApiHandler, '/flask/hello')
# api.add_resource(FullDownloadHandler, '/handle_full')
# api.add_resource(CleanupHandler, '/cleanup')
api.add_resource(KofiWebhookHandler, '/kofi_webhook')
api.add_resource(PremiumVerificationHandler, '/verify_premium')
api.add_resource(PremiumLoginHandler, '/login_premium')

@app.route('/')
def serve():
    return render_template('index.html')