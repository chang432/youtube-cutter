import json
import boto3
from datetime import datetime, timezone
from api.DynamoDbHelper import DynamoDbHelper

def remove_expired_items():
    print("[CUSTOM] Starting premiumExpirationHandler.py")

    ddb_helper = DynamoDbHelper(table_name="youtube-cutter-dev-premium-subscribers")

    ddb_helper.removeExpiredItems()

    print("[CUSTOM] Finishing premiumExpirationHandler.py")

    return "done"

if __name__ == "__main__":
    remove_expired_items()