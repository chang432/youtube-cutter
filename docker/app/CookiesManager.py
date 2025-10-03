import os
import boto3
import json
import Logger
from datetime import datetime

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
                            "lastModified": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
                        })

                # Write cookies_status to JSON file
                json_file_path = os.path.join(self.cookies_staging, "cookies_status.json")
                with open(json_file_path, "w") as json_file:
                    json.dump(cookies_status, json_file, indent=4)
    
    
    def refresh_cookies(self):
        """
        Refresh any cookies that have been changed in s3
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
                local_last_modified = datetime.strptime(cookie["lastModified"], "%Y-%m-%d %H:%M:%S.%f")
                if s3_last_modified > local_last_modified:
                    # Download updated file
                    print(f"Pulling updated cookie {file_name} from s3 because (s3: {s3_last_modified} > local: {local_last_modified})")
                    self.s3_client.download_file(BUCKET_NAME, s3_key, local_file_path)
                    cookie["lastModified"] = s3_last_modified
                    cookie["valid"] = True
            except Exception as e:
                print(f"Error checking refresh status or refreshing {file_name}: {e}")

        # Update cookies_status.json
        with open(json_file_path, "w") as json_file:
            json.dump(cookies_status, json_file, indent=4)
        

    def testing(self):
        return "This is a test function in cookiesManager.py"

if __name__ == "__main__":
    print("hello")
