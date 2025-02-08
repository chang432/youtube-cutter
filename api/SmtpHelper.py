import boto3
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

class SmtpHelper:
    ssm_client = boto3.client("ssm")
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    GMAIL_USERNAME = "wavninja.team@gmail.com"
    GMAIL_PASSWORD = ssm_client.get_parameter(Name="wavninja-app-password",WithDecryption=True)["Parameter"]["Value"]

    @staticmethod
    def sendEmail(destinationEmail, emailTitle, emailBody):
        # Email Details
        SENDER_EMAIL = SmtpHelper.GMAIL_USERNAME
        RECIPIENT_EMAIL = destinationEmail
        SUBJECT = emailTitle

        # Email Content
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = RECIPIENT_EMAIL
        msg["Subject"] = SUBJECT
        body = emailBody
        msg.attach(MIMEText(body, "plain"))

        try:
            server = smtplib.SMTP(SmtpHelper.SMTP_SERVER, SmtpHelper.SMTP_PORT)
            server.starttls()  # Secure the connection
            server.login(SmtpHelper.GMAIL_USERNAME, SmtpHelper.GMAIL_PASSWORD)  # Authenticate
            
            server.sendmail(SENDER_EMAIL, RECIPIENT_EMAIL, msg.as_string())
            print(f"Email sent successfully to {destinationEmail}!")
            server.quit()

        except Exception as e:
            print(f"Error: {e}")


