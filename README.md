# wav.ninja

Welcome to the [wav.ninja](https://wav.ninja)! This app allows users to input a YouTube URL, generate a waveform representation of the audio, cut a segment of the audio, and then download that segment in either MP3 or WAV format. The frontend of the app is built using ReactJS, Vite, TailwindCSS, and DaisyUI, while the backend is powered by Python using Pytube. Backend is hosted using AWS.


![image](https://github.com/chang432/youtube-cutter/assets/88285952/eb617cf4-5ad7-4da0-b375-bc39421af4a9)

<img width="1280" alt="image" src="https://github.com/chang432/youtube-cutter/assets/88285952/bb1b7300-d216-4fb2-93b4-955c3460fa4a">

## Installation

Before you can run the app locally or deploy it remotely, you'll need to set up the development environment. Follow these steps:

- Clone repository and cd into project directory 
`cd youtube-cutter`
- Install the required Python packages using pip.
`pip install -r requirements.txt`

*Note: The app requires ffmpeg 4.1.3 for macOS, and it's automatically tracked in the "binaries/ffmpeg" directory.*

- To install the frontend dependencies, run:
```bash
cd frontend
npm install
```


## Run Locally

To test the app locally, use the following command:

`bash local_deploy.sh`

The above command, executed in the root directory, will perform the following steps:

- Build the React files for the frontend.
- Run the local Flask app for the backend

Alternatively, if you only wish to run frontend, run the following:
```bash
cd frontend
npm run dev
```




## Deployment

To deploy the app remotely, follow these steps:

`bash deploy_dev.sh`

The above command, executed in the root directory, will perform the following steps:

- Build the React files for the frontend.
- Replace static file references with S3 URLs.
- Replace localhost URLs with the web URL.
- Upload static files to Amazon S3.
- Update the Lambda function.
- Reconfigure built files to use local references again.

## Info
- Pulls from https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js and https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm


## Premium Services Design 
Users are able to sign up for a monthly donation on Ko-fi to get access to additional audio processing tools for videos. T
he following is the system design workflow:

Sign up workflow
1. User signs up for monthly donation on Ko-fi
2. Ko-fi webhook automatically sends api request to wav.ninja/kofi_payment which, in the backend, adds the row representing the user to a dynamodb table as well as sends an email to the user with a randomly generated access key.
    - The new entry consists of the email, randomly generated access key, and timestamp.

Processing workflow
1. User inputs access key into the premium services text box.
2. Backend queries the db and returns whether a row with the access_key exists or not.
3. If exists, then grant user access to additional tools.

Expiration handler workflow
1. A daily eventbridge rule will trigger a lambda that will scan all entries in the db for any rows that have a timestamp older than 31 days compared to the current date.
2. The lambda will delete any rows that fit this criteria and email the user that their access is revoked as they have not continued with the subscription.


## Docker project
docker/**
Files to get backend built as docker images

## License

[MIT](https://choosealicense.com/licenses/mit/)


