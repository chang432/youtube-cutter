import { useState, useEffect, useRef } from "react";
import ninja from "./assets/wavninja-nobg.png";
import axios from "axios";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.js";
import LoadingBar from "./components/LoadingBar";
import Disclaimer from "./components/Disclaimer";
import ThemeSwitch from "./components/ThemeSwitch";
import { WaveSpinner } from "react-spinners-kit";
import PremiumServices from "./components/PremiumServices";
import FfmpegWasmHelper from "./components/FfmpegWasmHelper";
import PremiumDialog from "./components/PremiumDialog";
import testAudioFile from "./assets/bmf.mp3";         // Used for local testing, comment out when deploying

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faPause,
    faRotateLeft,
    faMugHot,
    faCircleUp,
    faDownload
} from "@fortawesome/free-solid-svg-icons";

function App() {
    const developMode = false;     // Set to true to skip the youtube url input and go straight to cutter ui with a local audio file

    const [audioSrc, setAudioSrc] = useState("");
    const [origAudioSrc, setOrigAudioSrc] = useState(audioSrc);
    const [fullDownloadYoutubeId, setFullDownloadYoutubeId] = useState("");
    const [startTime, setStartTime] = useState("00:00:00");
    const [endTime, setEndTime] = useState("00:00:00");
    const [displaySearchUI, setDisplaySearchUI] = useState(true);
    const [displayCutterUI, setDisplayCutterUI] = useState(false);
    const [waver, setWaver] = useState(null);
    const [waverRegion, setWaverRegion] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [audioFormat, setAudioFormat] = useState("MP3");
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [fileName, setFileName] = useState(null);
    const [showPremiumDialog, setShowPremiumDialog] = useState(false);

    // start and end time in seconds for waveform
    const [endDuration, setEndDuration] = useState(0);

    const waveSurferRef = useRef(null);
    let clickedInsideStartInputBox = { value: false };
    let clickedInsideEndInputBox = { value: false };

    const [showLoader, setShowLoader] = useState(false);

    const waverRegionRef = useRef(waverRegion);
    const startTimeRef = useRef(startTime);
    const endTimeRef = useRef(endTime);

    function isValidTime(str) {
        // console.log("checking time: " + str)
        let times = str.split(":");
        if (str.length != 8) {
            return false;
        } else if (
            strIsNotNumber(times[0]) ||
            strIsNotNumber(times[1]) ||
            strIsNotNumber(times[2])
        ) {
            return false;
        }

        return true;
    }

    useEffect(() => {
        startTimeRef.current = startTime;
        if (
            isValidTime(startTimeRef.current) &&
            startTimeRef.current >= endTimeRef.current
        ) {
            moveStartOrEndToNotOverlap();
        }
    }, [startTime]);

    useEffect(() => {
        endTimeRef.current = endTime;
        // console.log("start: " + startTimeRef.current + ", end: " + endTimeRef.current + ", isValidTime: " + isValidTime(endTimeRef.current))
        if (
            isValidTime(endTimeRef.current) &&
            startTimeRef.current >= endTimeRef.current
        ) {
            // console.log("executing moveStartOrEndToNotOverlap")
            moveStartOrEndToNotOverlap();
        }
    }, [endTime]);

    useEffect(() => {
        waverRegionRef.current = waverRegion;
    }, [waverRegion]);

    function convertYoutubeUrlToId(url) {
        const yt = url.match(
            /(?:https?:\/\/)?(?:www\.)?youtu(?:be)?\.(?:com|be)\/(?:watch\?v=|)([^\s&]+)/
        );
        let yt_id = yt[1];

        if (yt_id.length != 11) {
            throw Error("Incorrect youtube id");
        }

        console.log("youtube id is: " + yt_id);
        return yt_id;
    }

    useEffect(() => {
        // developing use for going straight to the cutter ui without having to paste in a youtube url]
        if (developMode) {
            setDisplaySearchUI(false);
            setFileName("bmf")
            setAudioSrc(testAudioFile);
            setOrigAudioSrc(testAudioFile);
            setDisplayCutterUI(true);
        }
    }, []);

    function keydownEnterEventHandler(event, isStartInput) {
        let time_ref = isStartInput ? startTimeRef.current : endTimeRef.current;
        let input_name = isStartInput ? "startTimeInput" : "endTimeInput";

        if (event.key === "Enter") {
            // console.log(input_name + " enter pressed: " + time_ref + ", " + waverRegionRef.current);
            if (isStartInput) {
                waverRegionRef.current.update({
                    start: unformatSeconds(startTimeRef.current, true),
                });
            } else {
                waverRegionRef.current.update({
                    end: unformatSeconds(endTimeRef.current, false),
                });
            }
        }
    }

    function outsideInputBoxClickEventHandler(
        event,
        inputElement,
        clickedInsideInputBox,
        isStartInput
    ) {
        let time_ref = isStartInput ? startTimeRef.current : endTimeRef.current;
        let input_name = isStartInput ? "startTimeInput" : "endTimeInput";

        if (
            !inputElement.contains(event.target) &&
            clickedInsideInputBox.value
        ) {
            // Execute your code here
            console.log(
                input_name +
                    " outside input box pressed: " +
                    time_ref +
                    ", " +
                    waverRegionRef.current
            );

            if (isStartInput) {
                waverRegionRef.current.update({
                    start: unformatSeconds(startTimeRef.current, true),
                });
            } else {
                waverRegionRef.current.update({
                    end: unformatSeconds(endTimeRef.current, false),
                });
            }

            clickedInsideInputBox.value = false;
        }
    }

    useEffect(() => {
        let inputElement = document.getElementById("startTimeInput");

        const keydownEnterEventHandlerRef = (event) =>
            keydownEnterEventHandler(event, true);
        inputElement.addEventListener("keydown", keydownEnterEventHandlerRef);

        const insideInputBoxClickEventHandlerRef = () => {
            clickedInsideStartInputBox.value = true;
        };
        inputElement.addEventListener(
            "click",
            insideInputBoxClickEventHandlerRef
        );

        const outsideInputBoxClickEventHandlerRef = (event) =>
            outsideInputBoxClickEventHandler(
                event,
                inputElement,
                clickedInsideStartInputBox,
                true
            );
        document.addEventListener("click", outsideInputBoxClickEventHandlerRef);

        return () => {
            // cleanup on unmount
            inputElement.removeEventListener(
                "keydown",
                keydownEnterEventHandlerRef
            );
            inputElement.removeEventListener(
                "click",
                insideInputBoxClickEventHandlerRef
            );
            document.removeEventListener(
                "click",
                outsideInputBoxClickEventHandlerRef
            );
        };
    }, []);

    useEffect(() => {
        let inputElement = document.getElementById("endTimeInput");

        const keydownEnterEventHandlerRef = (event) =>
            keydownEnterEventHandler(event, false);
        inputElement.addEventListener("keydown", keydownEnterEventHandlerRef);

        const insideInputBoxClickEventHandlerRef = () => {
            clickedInsideEndInputBox.value = true;
        };
        inputElement.addEventListener(
            "click",
            insideInputBoxClickEventHandlerRef
        );

        const outsideInputBoxClickEventHandlerRef = (event) =>
            outsideInputBoxClickEventHandler(
                event,
                inputElement,
                clickedInsideEndInputBox,
                false
            );
        document.addEventListener("click", outsideInputBoxClickEventHandlerRef);

        return () => {
            // cleanup on unmount
            inputElement.removeEventListener(
                "keydown",
                keydownEnterEventHandlerRef
            );
            inputElement.removeEventListener(
                "click",
                insideInputBoxClickEventHandlerRef
            );
            document.removeEventListener(
                "click",
                outsideInputBoxClickEventHandlerRef
            );
        };
    }, [endDuration]);

    // The following adjusts the wavesurfer region to match the start and end time exactly because sometimes its slightly off
    useEffect(() => {
        if (waverRegion) {
            let inputElement =
                document.getElementsByClassName("wavesurfer-region")[0];

            inputElement.addEventListener("mousedown", () => {
                document.addEventListener("mouseup", handleMouseUp);
            });

            function handleMouseUp() {
                waverRegionRef.current.update({
                    start: unformatSeconds(startTimeRef.current, true),
                    end: unformatSeconds(endTimeRef.current, false),
                });
                document.removeEventListener("mouseup", handleMouseUp);
            }
        }
    }, [waverRegion]);

    useEffect(() => {
        if (audioSrc) {
            let wavColor = isDarkMode ? "white" : "black";
            // Instantiate WaveSurfer
            const wavesurfer = WaveSurfer.create({
                container: waveSurferRef.current,
                waveColor: wavColor,
                progressColor: "lightblack",
                barWidth: 2,
                barGap: 1,
                barRadius: 2,
                hideScrollbar: true,
            });

            // Load audio source
            wavesurfer.load(audioSrc);

            // Add a region
            wavesurfer.registerPlugins([RegionsPlugin.create()]);

            wavesurfer.on("ready", function () {
                let end_duration = wavesurfer.getDuration();

                try {
                    setStartTime(formatSeconds(0));
                    setEndTime(formatSeconds(end_duration));
                } catch (e) {
                    console.error(e);
                }

                const wsRegion = wavesurfer.addRegion({
                    start: 0, // Start time in seconds
                    end: end_duration, // End time in seconds
                    color: "rgba(255, 0, 0, 0.3)", // Region color
                    drag: true, // Enable dragging the region
                    resize: true, // Enable resizing the region
                });

                setEndDuration(end_duration);
                setWaverRegion(wsRegion);

                setShowLoader(false);
            });

            wavesurfer.on("region-updated", function (region) {
                setStartTime(formatSeconds(region.start));
                setEndTime(formatSeconds(region.end));
            });

            wavesurfer.on("interaction", function () {
                try {
                    setTimeout(() => {
                        let curr_time = wavesurfer.getCurrentTime() !== null ? wavesurfer.getCurrentTime() : 0

                        document.getElementById("current-time").innerText =
                            formatSeconds(curr_time);
                    }, 0);
                } catch (e) {
                    console.error(e);
                }
            });

            wavesurfer.on("audioprocess", function () {
                try {
                    // if playhead hits endTime locator, loop around
                    if (
                        Math.trunc(wavesurfer.getCurrentTime()) ==
                        unformatSeconds(endTimeRef.current, false)
                    ) {
                        wavesurfer.setCurrentTime(
                            unformatSeconds(startTimeRef.current, true)
                        );
                    }

                    let curr_time = wavesurfer.getCurrentTime() !== null ? wavesurfer.getCurrentTime() : 0
                    document.getElementById("current-time").innerText =
                        formatSeconds(curr_time);
                } catch (e) {
                    console.error(e);
                }
            });

            setWaver(wavesurfer);

            return () => {
                wavesurfer.destroy();
            };
        }
    }, [audioSrc, isDarkMode]);

    function getThumbnailFromUrl(ytl) {
        const yt = ytl.match(
            /(?:https?:\/\/)?(?:www\.)?youtu(?:be)?\.(?:com|be)\/(?:watch\?v=|)([^\s&]+)/
        );
        return yt ? `https://i3.ytimg.com/vi/${yt[1]}/maxresdefault.jpg` : null;
    }

    function moveStartOrEndToNotOverlap() {
        if (waverRegionRef.current) {
            let endDurationWhole = Math.floor(endDuration);
            let endTimeSeconds = unformatSeconds(endTimeRef.current, false);
            let startTimeSeconds = unformatSeconds(startTimeRef.current, true);
            // console.log(endTimeSeconds + ", " + endDurationWhole);
            if (endTimeSeconds < endDurationWhole) {
                waverRegionRef.current.update({ end: startTimeSeconds + 1 });
            } else {
                waverRegionRef.current.update({ start: endTimeSeconds - 1 });
            }
        }
    }

    function strIsNotNumber(str) {
        if (/^\d+$/.test(str)) {
            return false;
        }
        return true;
    }

    function formatSeconds(time) {
        // X seconds -> HH:MM:SS

        let hours = Math.floor(time / 3600).toString();
        if (hours.length == 1) {
            hours = "0" + hours;
        }
        if (hours.length > 2 || hours.length < 1) {
            throw Error("hours cannot be greater than 99 or empty!");
        } else if (strIsNotNumber(hours)) {
            throw Error("hours must be an integer!");
        }

        let minutes = (Math.floor(time / 60) - hours * 60).toString();
        if (minutes.length == 1) {
            minutes = "0" + minutes;
        }
        if (strIsNotNumber(minutes)) {
            throw Error("minutes must be an integer!");
        } else if (parseInt(minutes) < 0 || parseInt(minutes) > 60) {
            throw Error("minutes are invalid!");
        }

        let seconds = Math.floor(time % 60).toString();
        if (seconds.length == 1) {
            seconds = "0" + seconds;
        }
        if (strIsNotNumber(seconds)) {
            throw Error("seconds must be an integer!");
        } else if (parseInt(seconds) < 0 || parseInt(seconds) > 60) {
            throw Error("seconds are invalid!");
        }

        return hours + ":" + minutes + ":" + seconds;
    }

    function unformatSeconds(formatted_time, unformatting_start_time) {
        // HH:MM:SS -> X seconds

        let times = formatted_time.split(":");
        if (
            strIsNotNumber(times[0]) ||
            strIsNotNumber(times[1]) ||
            strIsNotNumber(times[2])
        ) {
            alert(
                "one of the hours, minutes, or seconds are not formatted correctly"
            );
            if (unformatting_start_time) {
                return 0;
            }
            return Math.floor(endDuration);
        }

        let hours = parseInt(times[0]);
        let minutes = parseInt(times[1]);
        let seconds = parseInt(times[2]);
        return hours * 3600 + minutes * 60 + seconds;
    }

    function playPauseClick() {
        setIsPlaying((prevState) => !prevState);
        waver?.playPause();
    }

    function playLoopClick() {
        setIsPlaying(true);
        waver?.setCurrentTime(unformatSeconds(startTimeRef.current, true));
        waver?.play();
    }

    function goHome() {
        if (!showLoader) {
            setAudioSrc(null);
            setDisplaySearchUI(true);
            setDisplayCutterUI(false);
        }
    }

    function downloadAndCleanup(url, title) {
        // Download video
        const link = document.createElement("a");
        link.href = url;

        // Use the onload event to trigger cleanup after download
        link.addEventListener("click", () => {
            setTimeout(() => {
                axios.post(
                    "http://127.0.0.1:5000/cleanup",
                    {
                        yt_title: title
                    },
                    {
                        responseType: "json",
                    }
                );
            }, 3000);
        });

        link.click();
    }

    async function handleFullVideoClick(isCut = false, downloadMp3 = false) {
        console.log("Displaying full video");
        let youtube_id = "";

        try {
            youtube_id = convertYoutubeUrlToId(fullDownloadYoutubeId);
        } catch (error) {
            alert(error);
            return;
        }

        setDisplaySearchUI(false);
        setShowLoader(true);

        if (isCut) {
            await FfmpegWasmHelper.load();
        }

        axios({
            url: "http://127.0.0.1:5000/handle_full",
            method: "post",
            responseType: "json",
            data: {
                yt_id: youtube_id,
                is_cut: isCut,
                download_mp3: downloadMp3
            },
        })
            .then((res) => {
                const output = res.data;

                if (output.error == "true") {
                    console.log(output.error);
                    setShowLoader(false);
                    setDisplaySearchUI(true);
                    alert(
                        `Error...${output.message}`
                    );
                } else if (isCut) {
                    console.log(output);
                    setFileName(output.title)
                    setAudioSrc(output.url);
                    setOrigAudioSrc(output.url);
                    setDisplayCutterUI(true);
                } else {
                    downloadAndCleanup(output.url, output.title);

                    setShowLoader(false);
                    setDisplaySearchUI(true);
                    waver?.destroy();
                    setAudioSrc(null);
                }
            })
            .catch((error) => {
                console.log(error);
                setShowLoader(false);
                setDisplaySearchUI(true);
                alert(
                    `Server error...${error}`
                );
            });
    }

    const handleFullVideoTextChange = (event) => {
        setThumbnailUrl(getThumbnailFromUrl(event.target.value));
        setFullDownloadYoutubeId(event.target.value);
    };

    const handleStartTimeTextChange = (event) => {
        setStartTime(event.target.value);
    };

    const handleEndTimeTextChange = (event) => {
        setEndTime(event.target.value);
    };

    async function handleCutVideoClick() {
        setDisplayCutterUI(false);
        setShowLoader(true);
        waver?.pause();

        let audio_type = document.getElementById("mp3_btn").checked
            ? "mp3"
            : "wav";

        console.log("downloading cut video in " + audioFormat + " form");
        console.log(fileName)

        let browserFileNameToCut = "processed_audio.m4a";
        if (!(await FfmpegWasmHelper.fileExists("processed_audio.m4a"))) {
            browserFileNameToCut = "og_audio.m4a"
            await FfmpegWasmHelper.ffmpeg.writeFile("og_audio.m4a", await FfmpegWasmHelper.fetchFile(origAudioSrc));
        }

        let cutFileName = fileName + "." + audio_type

        await FfmpegWasmHelper.ffmpeg.exec(['-i', browserFileNameToCut, "-ss", startTime, "-to", endTime, "-write_xing", "0", "-y", cutFileName]);

        let data = await FfmpegWasmHelper.ffmpeg.readFile(cutFileName);
        let dataUrl = URL.createObjectURL(new Blob([data.buffer], {type: 'audio/'+audio_type}))

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = cutFileName;
        link.click();

        FfmpegWasmHelper.deleteFiles(["og_audio.m4a", "processed_audio.m4a", cutFileName]);    // cleanup

        setShowLoader(false);
        setDisplaySearchUI(true);
        waver?.destroy();
        setAudioSrc(null);
        setOrigAudioSrc(null);
    }

    function handleDonationClick() {
        window.open("https://ko-fi.com/wavninja", "_blank");
    }

    return (
        <div
            data-theme={`${isDarkMode ? "black" : "lofi"}`}
            className=" transition-colors duration-300 ease-in-out mx-auto "
        >
            <button
                className="fixed top-4 left-6"
                onClick={handleDonationClick}
            >
                <FontAwesomeIcon icon={faMugHot} className="fa-2xl" />
            </button>
            <button
                className="fixed top-4 left-20"
                onClick={() => {setShowPremiumDialog(true)}}
            >
                <FontAwesomeIcon icon={faCircleUp} className="fa-2xl" />
            </button>
            <ThemeSwitch
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                setIsPlaying={setIsPlaying}
            />
            <div className={`flex flex-col justify-center ${displayCutterUI ? "h-fit py-20" : "h-screen"} items-center`}>
                {/* <h1 className="text text-red-600">We are aware of some issues, please hold while we fix</h1> */}
                <div className="flex flex-col justify-center items-center w-full" >
                    <button onClick={goHome} className="text-8xl mb-4">
                        wav.ninja
                        <img
                            src={ninja}
                            className={`inline w-28 h-28 ${
                                isDarkMode ? "invert" : ""
                            } `}
                        ></img>
                    </button>

                    { showPremiumDialog && <PremiumDialog setShowPremiumDialog={setShowPremiumDialog}/> }

                    {displaySearchUI && (
                        <div className="flex flex-col justify-center items-center w-full">
                            <input
                                type="text"
                                value={fullDownloadYoutubeId}
                                onChange={handleFullVideoTextChange}
                                placeholder="Paste Youtube link here"
                                className="input input-bordered input-primary w-full max-w-2xl input-lg  "
                            />
                            {thumbnailUrl && (
                                <img
                                    src={thumbnailUrl}
                                    className={` mt-5 h-36`}
                                />
                            )}
                            <div className="flex inline-flex mt-10">
                                <button
                                    className="btn bg-white text-2xl text-black mr-6"
                                    onClick={() => handleFullVideoClick(true)}
                                >
                                    BEGIN CUT
                                </button>
                                <p className="text-2xl mt-2">or</p>
                                <div className="btn-group ml-6">
                                    <button
                                        className="btn bg-white text-2xl text-black"
                                        onClick={() => handleFullVideoClick(false, false)}
                                    >
                                        <FontAwesomeIcon icon={faDownload} size="xs" className="mr-2" style={{color: "#000000",}}/>
                                        WAV
                                    </button>
                                    <button
                                        className="btn bg-white text-2xl text-black"
                                        onClick={() => handleFullVideoClick(false, true)}
                                    >
                                        <FontAwesomeIcon icon={faDownload} size="xs" className="mr-2" style={{color: "#000000",}}/>
                                        MP3
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {displayCutterUI && <PremiumServices className="z-40" audioSrc={audioSrc} setAudioSrc={setAudioSrc} setShowLoader={setShowLoader} origAudioSrc={origAudioSrc} displayCutterUI={displayCutterUI} setDisplayCutterUI={setDisplayCutterUI} setShowPremiumDialog={setShowPremiumDialog} /> }
                {displayCutterUI && (
                    <span className="mt-6" style={{ paddingBottom: "5px" }} id="current-time">
                        00:00:00
                    </span>
                )}
                <WaveSpinner
                    size={90}
                    color={`${isDarkMode ? "#fff" : "#000"}`}
                    loading={showLoader}
                />
                <div
                    hidden={!displayCutterUI}
                    id="waveform"
                    ref={waveSurferRef}
                    className="z-42"
                    style={{ width: "80%" }}
                />
                <div
                    className={`flex flex-col justify-center items-center w-full ${
                        displayCutterUI ? "" : "hidden"
                    } mt-10`}
                >
                    <div className="w-4/5 flex flex-row justify-between">
                        <input
                            id="startTimeInput"
                            type="text"
                            value={startTime}
                            onChange={handleStartTimeTextChange}
                            className="input input-bordered rounded-none input-primary xs:p-4 p-2 xs:w-1/6 w-1/5"
                        />
                        <div>
                            <button
                                className="btn mr-5 rounded-none bg-secondary"
                                onClick={playPauseClick}
                            >
                                {isPlaying ? (
                                    <FontAwesomeIcon icon={faPause} />
                                ) : (
                                    <FontAwesomeIcon icon={faPlay} />
                                )}
                            </button>
                            <button
                                className="btn ml-5 rounded-none bg-secondary"
                                onClick={playLoopClick}
                            >
                                <FontAwesomeIcon icon={faRotateLeft} />
                            </button>
                        </div>
                        <input
                            id="endTimeInput"
                            type="text"
                            value={endTime}
                            onChange={handleEndTimeTextChange}
                            className="input input-bordered rounded-none input-primary xs:p-4 p-2 xs:w-1/6 w-1/5"
                        />
                    </div>
                    <div className="btn-group mt-10">
                        <input
                            id="wav_btn"
                            type="radio"
                            name="options"
                            data-title="WAV"
                            className={`btn btn-outline border-black`}
                            checked
                        />
                        <input
                            id="mp3_btn"
                            type="radio"
                            name="options"
                            data-title="MP3"
                            className={`btn btn-outline border-black`}
                        />
                    </div>
                    <button
                        className="btn mt-10 rounded-none w-1/4 bg-accent"
                        onClick={handleCutVideoClick}
                    >
                        &#x2694;&nbsp;&nbsp;&nbsp;CUT&nbsp;&nbsp;&nbsp;&#x2694;
                    </button>
                </div>
                <Disclaimer 
                    showDisclaimer={showDisclaimer}
                    setShowDisclaimer={setShowDisclaimer}
                />
            </div>
        </div>
    );
}

export default App;
