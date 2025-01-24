import React, { useEffect, useState } from 'react';

import { useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import FrequencySlider from "./FrequencySlider";

const PremiumServices = ({audioSrc, setAudioSrc}) => {
    const [origAudioSrc, setOrigAudioSrc] = useState(audioSrc);
    const [speedSlowestHighlighted, setSpeedSlowestHighlighted] = useState(false);
    const [speedSlowHighlighted, setSpeedSlowHighlighted] = useState(false);
    const [speedNormalHighlighted, setSpeedNormalHighlighted] = useState(true);
    const [speedFastHighlighted, setSpeedFastHighlighted] = useState(false);
    const [speedFastestHighlighted, setSpeedFastestHighlighted] = useState(false);
    const speedHighlightedArr = [["slowest",setSpeedSlowestHighlighted], ["slow",setSpeedSlowHighlighted], ["normal",setSpeedNormalHighlighted], ["fast",setSpeedFastHighlighted], ["fastest",setSpeedFastestHighlighted]];
    const speedValArr = {"slowest":0.5, "slow":0.75, "normal":1.0, "fast":1.5, "fastest":2.0};
    const selectedSpeed = useRef("normal")

    const [reverseSelected, setReverseSelected] = useState(false);

    const ffmpegRef = useRef(new FFmpeg());
    var ffmpegLoaded = false;

    const freqLimit = 24000;   // TODO: Change this to 1/2 the sample rate or some other dynamic val in the future?
    const [freqRange, setFreqRange] = useState([0, freqLimit]);

    useEffect(async () => {
        if (!ffmpegLoaded) {
            console.log("ffmpeg not loaded, doing now!");

            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'
            const ffmpeg = ffmpegRef.current;
            // ffmpeg.on('log', ({ message }) => {
            //     console.log(message);
            // });
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            ffmpegLoaded = true;
        }
    }, []);

    function handleSpeedClick(speed) {
        for (let i = 0; i < speedHighlightedArr.length; i++) {
            if (speedHighlightedArr[i][0] === speed) {
                speedHighlightedArr[i][1](true);
                selectedSpeed.current = speed;
            } else {
                speedHighlightedArr[i][1](false);
            }
        }
    }

    function handleReverseClick() {
        setReverseSelected(!reverseSelected);
    }

    async function applySettings() {
        let reverseFilterString = reverseSelected ? "areverse," : "";

        let speedSetting = speedValArr[selectedSpeed.current];
        let speedFilterString = "atempo=" + speedSetting + ",";
        
        let highcutFilter = "lowpass=f=" + freqRange[1];
        let lowcutFilter = "highpass=f=" + freqRange[0];
        let freqFilterString = highcutFilter + "," + lowcutFilter;

        let filterString = reverseFilterString + speedFilterString + freqFilterString;
        console.log(filterString);

        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile('input.mp3', await fetchFile(origAudioSrc));
        await ffmpeg.exec(['-i', 'input.mp3', '-af', filterString, 'output.mp3']);
        const data = await ffmpeg.readFile('output.mp3');
        setAudioSrc(URL.createObjectURL(new Blob([data.buffer], {type: 'audio/mp3'})))
    }

    return (
        <div className="flex flex-row space-x-28 items-top justify-center w-full py-10">
            <div className="flex flex-col items-center space-y-5">
                <h1>Speed</h1>
                <div className="flex flex-row font-black">
                    <div className="flex flex-col w-10 items-center">
                        <h1 className="text-sm cursor-default">0.5</h1>
                        <h1 className={`text-xl cursor-pointer ${speedSlowestHighlighted ? "text-red-600": ""}`} onClick={() => {handleSpeedClick("slowest")}}>&lt;&lt;</h1>
                    </div>
                    <div className="flex flex-col w-10 items-center">
                        <h1 className="text-sm cursor-default">0.75</h1>
                        <h1 className={`text-xl cursor-pointer ${speedSlowHighlighted ? "text-red-600": ""}`} onClick={() => {handleSpeedClick("slow")}}>&lt;&lt;</h1>
                    </div>
                    <div className="flex flex-col w-10 items-center">
                        <h1 className="text-sm cursor-default">1.0</h1>
                        <h1 className={`text-xl cursor-pointer ${speedNormalHighlighted ? "text-red-600": ""}`} onClick={() => {handleSpeedClick("normal")}}>O</h1>
                    </div>
                    <div className="flex flex-col w-10 items-center">
                        <h1 className="text-sm cursor-default">1.5</h1>
                        <h1 className={`text-xl cursor-pointer ${speedFastHighlighted ? "text-red-600": ""}`} onClick={() => {handleSpeedClick("fast")}}>&gt;&gt;</h1>
                    </div>
                    <div className="flex flex-col w-10 items-center">
                        <h1 className="text-sm cursor-default">2.0</h1>
                        <h1 className={`text-xl cursor-pointer ${speedFastestHighlighted ? "text-red-600": ""}`} onClick={() => {handleSpeedClick("fastest")}}>&gt;&gt;</h1>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center space-y-5">
                <h1>Frequency Cutoff (Hz)</h1>
                <FrequencySlider freqRange={freqRange} setFreqRange={setFreqRange} freqLimit={freqLimit}/>
            </div>
            <div className="flex flex-col items-center justify-center space-y-5">
                <button className={`text-white py-2 px-3 ${reverseSelected ? "bg-red-600" : "bg-black"}`} onClick={handleReverseClick}>Reverse</button>
            </div>
            <button onClick={applySettings}>Apply</button>
        </div>
    );
};

export default PremiumServices;