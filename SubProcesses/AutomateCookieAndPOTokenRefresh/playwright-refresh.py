import asyncio
import boto3
import json
import re
from playwright.async_api import async_playwright


async def main():
    video_url = "https://www.youtube.com/embed/jhFN2euTUNY"
    s3_bucket = "youtube-cutter-private-prod"
    s3_key = "..."
    ssm_param = "..."

    s3 = boto3.client("s3")
    ssm = boto3.client("ssm")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, channel="chrome")
        context = await browser.new_context()  # Incognito context
        page = await context.new_page()

        print("\nBrowser opened in incognito mode. Please log into your YouTube account.")
        await page.goto("https://accounts.google.com/ServiceLogin?service=youtube")
        input("After logging in, press Enter here to continue...")

        print(f"\nNavigating to video: {video_url}")
        await page.goto(video_url)
        await page.wait_for_timeout(10000)

        # Extract and save cookies
        cookies = await context.cookies()
        cookie_file = "youtube_session.txt"
        with open(cookie_file, "w") as f:
            json.dump(cookies, f)
        # s3.upload_file(cookie_file, s3_bucket, s3_key)
        # print(f"Session cookies uploaded to s3://{s3_bucket}/{s3_key}")

        # # Extract PO_TOKEN
        # content = await page.content()
        # match = re.search(r'"PO_TOKEN":"(.*?)"', content)
        # if match:
        #     po_token = match.group(1)
        #     print(f"PO_TOKEN extracted: {po_token[:8]}...")

        #     ssm.put_parameter(
        #         Name=ssm_param,
        #         Value=po_token,
        #         Type="SecureString",
        #         Overwrite=True
        #     )
        #     print(f"PO_TOKEN stored in AWS SSM under: {ssm_param}")
        # else:
        #     print("❌ Could not find PO_TOKEN in page.")

        await browser.close()

# Run it
if __name__ == "__main__":
    asyncio.run(main())
