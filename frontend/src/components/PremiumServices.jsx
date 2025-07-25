import React, { useState, useRef } from 'react';
import FrequencySlider from "./FrequencySlider";
import FfmpegWasmHelper from "./FfmpegWasmHelper";

const PremiumServices = ({
    audioSrc,
    setAudioSrc,
    setShowLoader,
    origAudioSrc,
    displayCutterUI,
    setDisplayCutterUI,
    setShowProfileDialog,
    premiumEnabled,
    setpremiumEnabled
}) => {
    // Remove collapsed state, use Tailwind's peer/hidden logic instead
    const [expanded, setExpanded] = useState(false);
    const [collapseAnimationEnded, setCollapseAnimationEnded] = useState(true);

    const [speedSlowestHighlighted, setSpeedSlowestHighlighted] = useState(false);
    const [speedSlowHighlighted, setSpeedSlowHighlighted] = useState(false);
    const [speedNormalHighlighted, setSpeedNormalHighlighted] = useState(true);
    const [speedFastHighlighted, setSpeedFastHighlighted] = useState(false);
    const [speedFastestHighlighted, setSpeedFastestHighlighted] = useState(false);
    const speedHighlightedArr = [
        ["slowest", setSpeedSlowestHighlighted],
        ["slow", setSpeedSlowHighlighted],
        ["normal", setSpeedNormalHighlighted],
        ["fast", setSpeedFastHighlighted],
        ["fastest", setSpeedFastestHighlighted]
    ];
    const speedValArr = {
        "slowest": 0.5,
        "slow": 0.75,
        "normal": 1.0,
        "fast": 1.5,
        "fastest": 2.0
    };
    const selectedSpeed = useRef("normal");

    const [reverseSelected, setReverseSelected] = useState(false);

    const freqLimit = 24000; // TODO: Change this to 1/2 the sample rate or some other dynamic val in the future?
    const [freqRange, setFreqRange] = useState([0, freqLimit]);

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
        try {
            setShowLoader(true);
            setDisplayCutterUI(false);
            setpremiumEnabled(false);

            let reverseFilterString = reverseSelected ? "areverse," : "";

            let speedSetting = speedValArr[selectedSpeed.current];
            let speedFilterString = "atempo=" + speedSetting + ",";

            let highcutFilter = "lowpass=f=" + freqRange[1];
            let lowcutFilter = "highpass=f=" + freqRange[0];
            let freqFilterString = highcutFilter + "," + lowcutFilter;

            let filterString = reverseFilterString + speedFilterString + freqFilterString;

            await FfmpegWasmHelper.ffmpeg.writeFile('og_audio.m4a', await FfmpegWasmHelper.fetchFile(origAudioSrc));
            await FfmpegWasmHelper.ffmpeg.exec(['-i', 'og_audio.m4a', '-af', filterString, 'processed_audio.m4a']);
            const data = await FfmpegWasmHelper.ffmpeg.readFile('processed_audio.m4a');
            setAudioSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'audio/m4a' })));

            setShowLoader(false);
            setDisplayCutterUI(true);
            setpremiumEnabled(true);
        } catch (error) {
            console.error("Caught error:", error.message);
        }
    }

    // Use Tailwind's group/peer/hidden logic for expand/collapse
    return (
        <div className="relative z-30 my-5 w-fit h-fit flex flex-col items-center">
            {/* Collapsed/Expanded bar */}
            <button
                className={`absolute z-[52] top-0 text-xs py-1 h-6 hover:bg-stone-400 ${collapseAnimationEnded ? "rounded-full border border-black w-20" : "rounded-t-xl border-t border-x border-black w-full"}`}
                onClick={() => {
                    if (!expanded) {
                        setCollapseAnimationEnded(false);
                    } 
                    setExpanded((prev) => !prev)
                }}
            >
                {expanded ? "▲" : "▼"}
            </button>

            {/* Overlay for non-premium */}
            {!premiumEnabled && expanded && (
                <div className="z-[51] absolute inset-0 w-full h-full opacity-90 hover:bg-gray-300 pointer-events-auto rounded-xl border border-black">
                    <div className="flex flex-row justify-center items-center w-full h-full opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <button className="h-6 text-red-600" onClick={() => {setShowProfileDialog(true)}}>?</button>
                    </div>
                </div>
            )}

            {/* Expanded controls */}
            <div
                className={`flex flex-col items-center border border-black rounded-xl transition-all duration-500 ease-in-out overflow-hidden ${expanded ? "max-h-full opacity-100 py-5 px-10 pt-10 space-y-8" : "max-h-0 opacity-0"}`}
                onTransitionEnd={(e) => {
                    // Only run logic when the max-height transition ends (not opacity)
                    if (e.propertyName === "max-height" && !expanded) {
                        // console.log("max-height transition ended");
                        setCollapseAnimationEnded(true);
                    }
                }}
            >
                {/* Premium Services */}
                <span className="text-base font-semibold">Premium Services</span>
                <div className={`flex xs:flex-row flex-col items-center justify-center w-fit xs:space-x-20`}>
                    <div className="flex flex-col items-center space-y-5">
                        <h1>Frequency Cutoff (Hz)</h1>
                        <FrequencySlider freqRange={freqRange} setFreqRange={setFreqRange} freqLimit={freqLimit} />
                    </div>
                    <div className="flex flex-col items-center space-y-5 ">
                        <h1>Speed</h1>
                        <div className="flex flex-row font-black">
                            <div className="flex flex-col w-10 items-center">
                                <h1 className="text-sm cursor-default">0.5</h1>
                                <h1 className={`text-xl cursor-pointer ${speedSlowestHighlighted ? "text-red-600" : ""}`} onClick={() => { handleSpeedClick("slowest") }}>&lt;&lt;</h1>
                            </div>
                            <div className="flex flex-col w-10 items-center">
                                <h1 className="text-sm cursor-default">0.75</h1>
                                <h1 className={`text-xl cursor-pointer ${speedSlowHighlighted ? "text-red-600" : ""}`} onClick={() => { handleSpeedClick("slow") }}>&lt;&lt;</h1>
                            </div>
                            <div className="flex flex-col w-10 items-center">
                                <h1 className="text-sm cursor-default">1.0</h1>
                                <h1 className={`text-xl cursor-pointer ${speedNormalHighlighted ? "text-red-600" : ""}`} onClick={() => { handleSpeedClick("normal") }}>O</h1>
                            </div>
                            <div className="flex flex-col w-10 items-center">
                                <h1 className="text-sm cursor-default">1.5</h1>
                                <h1 className={`text-xl cursor-pointer ${speedFastHighlighted ? "text-red-600" : ""}`} onClick={() => { handleSpeedClick("fast") }}>&gt;&gt;</h1>
                            </div>
                            <div className="flex flex-col w-10 items-center">
                                <h1 className="text-sm cursor-default">2.0</h1>
                                <h1 className={`text-xl cursor-pointer ${speedFastestHighlighted ? "text-red-600" : ""}`} onClick={() => { handleSpeedClick("fastest") }}>&gt;&gt;</h1>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-5">
                        <button className={` py-2 px-3 ${reverseSelected ? "bg-red-600 text-white" : "text-black"} border border-black`} onClick={handleReverseClick}>Reverse</button>
                    </div>
                </div>
                <button className="bg-black text-white py-2 px-3" onClick={applySettings}>Apply</button>
            </div>
        </div>
    );
};

export default PremiumServices;