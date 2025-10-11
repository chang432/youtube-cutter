import os
import boto3
import json
from datetime import datetime, timezone
from YtdlpHandler import YtdlpHandler
from Logger import Logger

BUCKET_NAME = "youtube-cutter-hetzner-vps"
COOKIES_PREFIX = "yt-credentials"

class CookiesManager:

    s3_client = boto3.client('s3')

    def __init__(self, staging_path="/tmp/cookies"):
        self.cookies_staging = f"{staging_path}/cookies_staging"
        self.init_cookies_staging()

    def init_cookies_staging(self):
        """
        Initialize the cookies staging directory and download cookies from S3.
        """
        if not os.path.exists(self.cookies_staging):
            os.makedirs(self.cookies_staging, exist_ok=True)

            response = self.s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=COOKIES_PREFIX)

            if 'Contents' not in response:
                raise ValueError("No cookies found in S3 bucket under the specified prefix.")

            cookies_status = {}
            cookies_status["current_cookie"] = {
                "path": None,
                "index": -1
            }

            cookies_info = []
            for obj in response['Contents']:
                file_name = obj['Key'].split('/')[-1]

                if file_name:  # Skip empty keys (e.g., folder prefixes)
                    local_file_path = os.path.join(self.cookies_staging, file_name)
                    self.s3_client.download_file(BUCKET_NAME, obj['Key'], local_file_path)
                    
                    # Add file details to cookies_status
                    cookies_info.append({
                        "name": file_name,
                        "valid": True,
                        "lastModified": str(datetime.now(timezone.utc))
                    })

            cookies_status["cookies"] = cookies_info

            # Write cookies_status to JSON file
            json_file_path = os.path.join(self.cookies_staging, "cookies_status.json")
            with open(json_file_path, "w") as json_file:
                json.dump(cookies_status, json_file, indent=4)
            
            self.update_current_cookie()


    def get_cookies_status(self):
        cookies_status_path = os.path.join(self.cookies_staging, "cookies_status.json")

        if not os.path.exists(cookies_status_path):
            raise FileNotFoundError("cookies_status.json not found in staging directory.")

        with open(cookies_status_path, "r") as json_file:
            cookies_status = json.load(json_file)
        
        return cookies_status

    
    def retrieve_current_cookie_path(self):
        """
        Retrieves the current valid cookie path from cookies_status.json
        """
        cookies_status = self.get_cookies_status()

        current_cookie = cookies_status["current_cookie"].get("path", None)

        if not current_cookie:
            raise ValueError("No valid cookies found in cookies_status.json")

        return current_cookie

    
    def resync_cookies(self):
        """
        Sync cookies from S3 and update state of each cookie. 
        """
        cookies_status = self.get_cookies_status()

        local_cookie_names = [cookie["name"] for cookie in cookies_status["cookies"]]

        remote_response = self.s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=COOKIES_PREFIX)

        for obj in remote_response.get('Contents', []):
            file_name = obj['Key'].split('/')[-1]
            local_file_path = os.path.join(self.cookies_staging, file_name)

            if not file_name:
                continue

            if file_name in local_cookie_names: 
                cur_cookie = cookies_status["cookies"][local_cookie_names.index(file_name)]
                remote_last_modified = obj['LastModified']

                # Compare dates
                local_last_modified = datetime.fromisoformat(cur_cookie["lastModified"])
                Logger.log(f"Comparing S3 last modified ({remote_last_modified}) with local last modified ({local_last_modified}) for {file_name}")
                if remote_last_modified > local_last_modified:
                    # Download updated file
                    Logger.log(f"Pulling updated cookie {file_name} from s3 because (s3: {remote_last_modified} > local: {local_last_modified})")
                    self.s3_client.download_file(BUCKET_NAME, obj['Key'], local_file_path)
                    cur_cookie["lastModified"] = str(remote_last_modified)
                    cur_cookie["valid"] = False
            else:
                Logger.log(f"Pulling new cookie {file_name} from s3")
                self.s3_client.download_file(BUCKET_NAME, obj['Key'], local_file_path)

                # Add new cookie to cookies_status
                cookies_status["cookies"].append({
                    "name": file_name,
                    "valid": False,
                    "lastModified": str(datetime.now(timezone.utc))
                })

        # Update cookies_status.json
        with open(os.path.join(self.cookies_staging, "cookies_status.json"), "w") as json_file:
            json.dump(cookies_status, json_file, indent=4)


    def swap_cookie(self):
        """
        Choose next valid cookie in the list and set it as current.
        """
        Logger.log(f"Swapping to next valid cookie", "CookieManager")
        cookies_status = self.get_cookies_status()
        cookies_len = len(cookies_status["cookies"])

        cur_idx = cookies_status["current_cookie"]["index"]
        next_idx = (cur_idx + 1) % cookies_len
        valid_cookie_found = False

        while next_idx != cur_idx:
            next_cookie = cookies_status["cookies"][next_idx]
            if next_cookie["valid"]:
                cookies_status["current_cookie"]["index"] = next_idx
                cookies_status["current_cookie"]["path"] = os.path.join(self.cookies_staging, next_cookie["name"])
                valid_cookie_found = True
            next_idx = (next_idx + 1) % cookies_len

        if not valid_cookie_found:
            Logger.log("No valid cookies available to swap to.", "CookieManager")
            raise ValueError("No valid cookies available to swap to.")

        with open(os.path.join(self.cookies_staging, "cookies_status.json"), "w") as json_file:
            json.dump(cookies_status, json_file, indent=4)

            Logger.log(f"Swapped to cookie: {cookies_status['current_cookie']['path']}", "CookieManager")
            return
        
