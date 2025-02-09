import boto3
from boto3.dynamodb.conditions import Attr, Key
import json
from datetime import datetime, timedelta, timezone
from api.SmtpHelper import SmtpHelper

class DynamoDbHelper:
    SUBJECT = "Wav Ninja Premium"
    BODY_TEXT = "The membership has not been renewed so the access key associated with this email has expired.\nThank you for supporting us!\n\n-Wav Ninja Team"

    def __init__(self, table_name):
        self.ddb = boto3.resource("dynamodb")
        self.table = self.ddb.Table(table_name)

    # Returns whether the input access_key exists in the table
    def checkItem(self, input_access_key):
        res = self.table.query(
            IndexName="access_key-index",
            KeyConditionExpression=Key("access_key").eq(input_access_key)
        )

        if res["Items"]:
            return True
    
        return False

    # Returns db entry associated with the input email in json
    def getItem(self, email):
        response = self.table.get_item(Key={'email': email}) 
    
        if 'Item' in response:
            return json.dumps(response['Item'], indent=4)  
        else:
            return json.dumps({"error": "Item not found"}, indent=4)
        
    # Removes db entry associated with the input email
    def removeItem(self, email):
        self.table.delete_item(
            Key={"email": email}
        )

    # Writes new row with the following values to db
    def putItem(self, email, access_key, timestamp):
        self.table.put_item(Item={
            "email": email,
            "access_key": access_key,
            "timestamp": timestamp
        })

    # Finds row with specified email and updates timestamp to specified timestamp
    def updateItem(self, email, new_timestamp):
        self.table.update_item(
            Key={"email":email},
            UpdateExpression="SET #t = :new_timestamp",
            ExpressionAttributeNames={"#t":"timestamp"},
            ExpressionAttributeValues={":new_timestamp":new_timestamp}
        )

    # Remove all rows that have a timestamp which is greater than 31 days before the current date (membership cancelled)
    def removeExpiredItems(self):
        curr_date = datetime.now(timezone.utc)
        curr_date_str = curr_date.strftime("%Y-%m-%d")
        expired_date = curr_date - timedelta(days=31)
        expired_date_str = expired_date.strftime("%Y-%m-%d")
        print(f"Current date: {curr_date_str}\nExpired date: {expired_date_str}")

        response = self.table.scan(
            FilterExpression=Attr("timestamp").lt(expired_date_str)
        )

        # For each expired row, remove it and send an email to the user to notify them of the removed access
        for item in response.get("Items", []):
            email_val = item["email"]

            pk = { "email": email_val }
            self.table.delete_item(
                Key=pk
            )
            print(f"Removed row with the following email and timestamp: ({item['email']}, {item['timestamp']})")

            SmtpHelper.sendEmail(destinationEmail=email_val, emailTitle=DynamoDbHelper.SUBJECT, emailBody=DynamoDbHelper.BODY_TEXT)

    

        

