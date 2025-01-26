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
- Pulls from https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js and https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm

## License

[MIT](https://choosealicense.com/licenses/mit/)


