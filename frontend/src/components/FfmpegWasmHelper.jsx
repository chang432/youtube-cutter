import React from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Helper class to interact with ffmpeg.wasm

class FfmpegWasmHelper extends React.Component {
    static ffmpeg = new FFmpeg();
    static ffmpegLoaded = false;
    static filterString = "";

    static async load() {
        if (!this.ffmpegLoaded) {
            console.log("ffmpeg not loaded, doing now!");

            this.ffmpeg.on('log', ({ message }) => {
                console.log(message);
            });
            await this.ffmpeg.load({
                // coreURL: await toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js", 'text/javascript'), 
                // wasmURL: await toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm", 'application/wasm')
                coreURL: await toBlobURL("https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js", 'text/javascript'),
                wasmURL: await toBlobURL("https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm", 'application/wasm')
            });

            this.ffmpegLoaded = true;
            console.log("ffmpeg finished loading!");
        }
    }

    static async fetchFile(file) {
        return await fetchFile(file);
    }

    static async fileExists(fileName) {
        let files = await this.ffmpeg.listDir("/");
        for (let file of files) {
            if (file.name === fileName) {
                return true;
            }
        }
        return false;
    }

    static async deleteFiles(fileNameList) {
        for (let fileName of fileNameList) {
            if (await this.fileExists(fileName)) {
                await this.ffmpeg.deleteFile(fileName);
            }
        }
    }
}

export default FfmpegWasmHelper;