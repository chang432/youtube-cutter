import os
import boto3
import json
from Logger import Logger
from datetime import datetime, timezone
from YtdlpHandler import YtdlpHandler
import random

BUCKET_NAME = "youtube-cutter-hetzner-vps"
COOKIES_PREFIX = "yt-credentials-test"

class CookiesManager:

    s3_client = boto3.client('s3')

    def __init__(self, staging_path="/tmp"):
        self.cookies_staging = f"{staging_path}/cookies_staging"
        self.init_cookies_staging()

    def init_cookies_staging(self):
        """
        Initialize the cookies staging directory and download cookies from S3.
        """
        if not os.path.exists(self.cookies_staging):
            os.makedirs(self.cookies_staging, exist_ok=True)

            response = self.s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=COOKIES_PREFIX)

            if 'Contents' in response:
                cookies_status = []
                for obj in response['Contents']:
                    file_name = obj['Key'].split('/')[-1]

                    if file_name:  # Skip empty keys (e.g., folder prefixes)
                        local_file_path = os.path.join(self.cookies_staging, file_name)
                        self.s3_client.download_file(BUCKET_NAME, obj['Key'], local_file_path)
                        
                        # Add file details to cookies_status
                        cookies_status.append({
                            "name": file_name,
                            "valid": True,
                            "lastModified": str(datetime.now(timezone.utc))
                        })

                # Write cookies_status to JSON file
                json_file_path = os.path.join(self.cookies_staging, "cookies_status.json")
                with open(json_file_path, "w") as json_file:
                    json.dump(cookies_status, json_file, indent=4)
            
            self.check_cookies_validity()

    
    def retrieve_valid_cookie_path(self):
        json_file_path = os.path.join(self.cookies_staging, "cookies_status.json")

        if not os.path.exists(json_file_path):
            raise FileNotFoundError("cookies_status.json not found in staging directory.")

        with open(json_file_path, "r") as json_file:
            cookies_status = json.load(json_file)

        valid_cookies = [cookie for cookie in cookies_status if cookie["valid"]]

        if not valid_cookies:
            raise ValueError("No valid cookies found in cookies_status.json")

        chosen_cookie = random.choice(valid_cookies)
        return os.path.join(self.cookies_staging, chosen_cookie["name"])

    def retrieve_cookie_path(self, cookie_name):
        cookie_path = self.cookies_staging + "/" + cookie_name
        if not os.path.exists(cookie_path):
            raise FileNotFoundError(f"Cookie named {cookie_name} does not exist. Please initialize first.")
        return cookie_path
    
    
    def resync_cookies(self):
        """
        Pulls down any cookies that have been changed in s3
        """
        json_file_path = os.path.join(self.cookies_staging, "cookies_status.json")

        if not os.path.exists(json_file_path):
            raise FileNotFoundError("cookies_status.json not found in staging directory.")

        with open(json_file_path, "r") as json_file:
            cookies_status = json.load(json_file)

        for cookie in cookies_status:
            file_name = cookie["name"]
            local_file_path = os.path.join(self.cookies_staging, file_name)
            s3_key = f"{COOKIES_PREFIX}/{file_name}"

            try:
                # Get S3 file's last modified date
                s3_metadata = self.s3_client.head_object(Bucket=BUCKET_NAME, Key=s3_key)
                s3_last_modified = s3_metadata["LastModified"]

                # Compare dates
                local_last_modified = datetime.fromisoformat(cookie["lastModified"])
                Logger.log(f"Comparing S3 last modified ({s3_last_modified}) with local last modified ({local_last_modified}) for {file_name}")
                if s3_last_modified > local_last_modified:
                    # Download updated file
                    Logger.log(f"Pulling updated cookie {file_name} from s3 because (s3: {s3_last_modified} > local: {local_last_modified})")
                    self.s3_client.download_file(BUCKET_NAME, s3_key, local_file_path)
                    cookie["lastModified"] = str(s3_last_modified)
                    cookie["valid"] = True
            except Exception as e:
                print(f"Error checking refresh status or refreshing {file_name}: {e}")

        # Update cookies_status.json
        with open(json_file_path, "w") as json_file:
            json.dump(cookies_status, json_file, indent=4)


    def check_cookies_validity(self):
        json_file_path = os.path.join(self.cookies_staging, "cookies_status.json")

        cookies_status = []
        with open(json_file_path, "r") as json_file:
            cookies_status = json.load(json_file)

        if not cookies_status:
            raise ValueError("No cookies found in cookies_status.json")

        for cookie in cookies_status:
            file_name = cookie["name"]
            Logger.log(f"Checking validity of " + file_name)
            local_file_path = os.path.join(self.cookies_staging, file_name)
            
            try:
                yt_object = YtdlpHandler("https://youtube.com/watch?v=Bu8bH2P37kY", local_file_path)

                yt_object.yt_dlp_request(shouldDownload=True)
                Logger.log(f"Testing passed, setting {file_name} status to valid")
                cookie["valid"] = True
            except Exception as e:
                Logger.log(f"Testing failed, setting {file_name} status is invalid\nerror in YtdlpHandler: {e}")
                cookie["valid"] = False
        
        # Write cookies_status to JSON file
        with open(json_file_path, "w") as json_file:
            json.dump(cookies_status, json_file, indent=4)
                    

if __name__ == "__main__":
    print("hello")
