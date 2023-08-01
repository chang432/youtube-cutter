import { useState, useEffect, useRef } from "react";
import ninja from "./assets/wavninja-nobg.png";
import axios from "axios";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.js";
import LoadingBar from "./components/LoadingBar";
import Disclaimer from "./components/Disclaimer";
import ThemeSwitch from "./components/ThemeSwitch";
import { WaveSpinner } from "react-spinners-kit";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faPause,
    faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

function App() {
    const developMode = false;
    const [iceSpiceMode, setIceSpiceMode] = useState(false);
    const [getMessage, setGetMessage] = useState({});
    const [audioSrc, setAudioSrc] = useState("");
    const [cutAudioSrc, setCutAudioSrc] = useState("");
    const [fullDownloadYoutubeId, setFullDownloadYoutubeId] = useState("");
    const [startTime, setStartTime] = useState("00:00:00");
    const [endTime, setEndTime] = useState("00:00:00");
    const [displaySearchUI, setDisplaySearchUI] = useState(true);
    const [displayCutterUI, setDisplayCutterUI] = useState(false);
    const [waver, setWaver] = useState(null);
    const [waverRegion, setWaverRegion] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showError, setShowError] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState("");

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
            return false
        } else if (
            strIsNotNumber(times[0]) ||
            strIsNotNumber(times[1]) ||
            strIsNotNumber(times[2])
        ) {
            return false
        }

        return true
    }

    useEffect(() => {
        startTimeRef.current = startTime;
        if (isValidTime(startTimeRef.current) && startTimeRef.current >= endTimeRef.current) {
            moveStartOrEndToNotOverlap();
        }
    }, [startTime]);

    useEffect(() => {
        endTimeRef.current = endTime;
        // console.log("start: " + startTimeRef.current + ", end: " + endTimeRef.current + ", isValidTime: " + isValidTime(endTimeRef.current))
        if (isValidTime(endTimeRef.current) && startTimeRef.current >= endTimeRef.current) {
            // console.log("executing moveStartOrEndToNotOverlap")
            moveStartOrEndToNotOverlap();
        }
    }, [endTime]);

    useEffect(() => {
        waverRegionRef.current = waverRegion;
    }, [waverRegion]);

    function convertYoutubeUrlToId(url) {
        let youtube_id = url;
        if (url.includes("youtube")) {
            youtube_id = url.substring(url.indexOf("watch?v=") + 8);
        }
        console.log("youtube id is: " + youtube_id);
        return youtube_id;
    }

    useEffect(() => {
        // developing use for going straight to the cutter ui without having to paste in a youtube url]
        if (developMode) {
            setDisplaySearchUI(false);
            setAudioSrc(
                "https://youtube-cutter-static-files-dev.s3.amazonaws.com/audio/tGTKY1dpo_E.mp3"
            );
            setDisplayCutterUI(true);
        }
    }, []);

    function keydownEnterEventHandler(event, isStartInput) {
        let time_ref = isStartInput ? startTimeRef.current : endTimeRef.current
        let input_name = isStartInput ? "startTimeInput" : "endTimeInput"
        
        if (event.key === "Enter") {
            console.log(
                input_name + " enter pressed: " +
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
        }
    }

    function outsideInputBoxClickEventHandler(event, inputElement, clickedInsideInputBox, isStartInput) {
        let time_ref = isStartInput ? startTimeRef.current : endTimeRef.current
        let input_name = isStartInput ? "startTimeInput" : "endTimeInput"

        if (
            !inputElement.contains(event.target) &&
            clickedInsideInputBox.value
        ) {
            // Execute your code here
            console.log(
                input_name + " outside input box pressed: " +
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

        const keydownEnterEventHandlerRef = (event) => keydownEnterEventHandler(event, true)
        inputElement.addEventListener("keydown", keydownEnterEventHandlerRef);

        const insideInputBoxClickEventHandlerRef = () => {clickedInsideStartInputBox.value = true;}
        inputElement.addEventListener("click", insideInputBoxClickEventHandlerRef);

        const outsideInputBoxClickEventHandlerRef = (event) => outsideInputBoxClickEventHandler(event, inputElement, clickedInsideStartInputBox, true)
        document.addEventListener("click", outsideInputBoxClickEventHandlerRef);

        return () => {
            // cleanup on unmount
            inputElement.removeEventListener("keydown", keydownEnterEventHandlerRef);
            inputElement.removeEventListener("click", insideInputBoxClickEventHandlerRef);
            document.removeEventListener("click", outsideInputBoxClickEventHandlerRef);
        }
    },[]);

    useEffect(() => {
        let inputElement = document.getElementById("endTimeInput");

        const keydownEnterEventHandlerRef = (event) => keydownEnterEventHandler(event, false)
        inputElement.addEventListener("keydown", keydownEnterEventHandlerRef);

        const insideInputBoxClickEventHandlerRef = () => {clickedInsideEndInputBox.value = true;}
        inputElement.addEventListener("click", insideInputBoxClickEventHandlerRef);

        const outsideInputBoxClickEventHandlerRef = (event) => outsideInputBoxClickEventHandler(event, inputElement, clickedInsideEndInputBox, false)
        document.addEventListener("click", outsideInputBoxClickEventHandlerRef);

        return () => {
            // cleanup on unmount
            inputElement.removeEventListener("keydown", keydownEnterEventHandlerRef);
            inputElement.removeEventListener("click", insideInputBoxClickEventHandlerRef);
            document.removeEventListener("click", outsideInputBoxClickEventHandlerRef);
        }
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
            let wavColor = isDarkMode ? "white" : "black"
            // Instantiate WaveSurfer
            console.log(waveSurferRef.current);
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
                    setEndTime(formatSeconds(end_duration / 4));
                } catch (e) {
                    console.error(e);
                }

                const wsRegion = wavesurfer.addRegion({
                    start: 0, // Start time in seconds
                    end: end_duration / 4, // End time in seconds
                    color: "rgba(255, 0, 0, 0.3)", // Region color
                    drag: true, // Enable dragging the region
                    resize: true, // Enable resizing the region
                });

                // console.log("WAVE FORM READY, SETTING END DURATION TO: " + end_duration)
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
                        document.getElementById("current-time").innerText =
                            formatSeconds(wavesurfer.getCurrentTime());
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

                    document.getElementById("current-time").innerText =
                        formatSeconds(wavesurfer.getCurrentTime());
                } catch (e) {
                    console.error(e);
                }
            });

            setWaver(wavesurfer);

            return () => {
                wavesurfer.destroy()
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
            alert("one of the hours, minutes, or seconds are not formatted correctly");
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

    function handleFullVideoClick() {
        setShowError(false);
        console.log("Displaying full video");
        setDisplaySearchUI(false);
        setShowLoader(true);

        let youtube_id = convertYoutubeUrlToId(fullDownloadYoutubeId);

        axios({
            url: "http://127.0.0.1:5000/handle_full",
            method: "post",
            responseType: "json",
            data: {
                yt_id: youtube_id,
            },
        })
            .then((res) => {
                // console.log("return post: " + res.data)
                const location = res.data;
                console.log(location);
                setAudioSrc(location.url);
                setDisplayCutterUI(true);
            })
            .catch((error) => {
                console.log("axios error:", error);
                setShowLoader(false);
                setDisplaySearchUI(true);
                setShowError(true);
                // alert(
                //     "Server error...try again and if it still persists, please let us know!"
                // );
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

    function handleCutVideoClick() {
        setDisplayCutterUI(false);
        setShowLoader(true);

        let audio_type = document.getElementById("mp3_btn").checked
            ? "MP3"
            : "WAV";

        console.log("downloading cut video in " + audio_type + " form");

        let youtube_id = convertYoutubeUrlToId(fullDownloadYoutubeId);

        axios({
            url: "http://127.0.0.1:5000/handle_cut",
            method: "post",
            responseType: "json",
            data: {
                yt_id: youtube_id,
                start_time: startTime,
                end_time: endTime,
                audio_type: audio_type,
            },
        })
            .then((res) => {
                // Display
                console.log("return post: " + res.data);
                setCutAudioSrc(res.data.url);

                // Download video
                const link = document.createElement("a");
                link.href = res.data.url;
                link.download = audio_type ? "test.mp3" : "test.wav";

                // Use the onload event to trigger cleanup after download
                link.addEventListener("click", () => {
                    setTimeout(() => {
                        axios.post(
                            "http://127.0.0.1:5000/cleanup",
                            {
                                yt_id: youtube_id,
                            },
                            {
                                responseType: "json",
                            }
                        );
                    }, 3000);
                });

                link.click();

                return;
            })
            .then(() => {
                setShowLoader(false);
                setDisplaySearchUI(true);
                waver?.destroy();
            })
            .catch((error) => {
                console.log("axios error:", error);
                alert(
                    "Server error...try again and if it still persists, please let us know!"
                );
            });
    }

    return (
        <div
            data-theme={`${isDarkMode ? "black" : "lofi"}`}
            className=" transition-colors duration-300 ease-in-out mx-auto "
        >
            <ThemeSwitch
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
            />
            <div className=" flex flex-col justify-center h-screen items-center">
                {/* {showLoader && <LoadingBar showLoader={showLoader} />} */}
                {displaySearchUI && (
                    <div className="flex flex-col justify-center items-center w-full">
                        <h1 className="text-8xl mb-10">
                            wav.ninja
                            <img
                                src={ninja}
                                className={`inline w-28 h-28 ${
                                    isDarkMode ? "invert" : ""
                                } `}
                            ></img>
                        </h1>

                        <input
                            type="text"
                            value={fullDownloadYoutubeId}
                            onChange={handleFullVideoTextChange}
                            placeholder="Paste Youtube link here"
                            className="input input-bordered input-primary w-full max-w-2xl input-lg  "
                        />
                        {thumbnailUrl && (
                            <img src={thumbnailUrl} className={` mt-5 h-36`} />
                        )}
                        <button
                            className="btn btn-outline text-2xl mt-5 "
                            onClick={handleFullVideoClick}
                        >
                            Display
                        </button>
                    </div>
                )}
                <p
                    className={`absolute p-4 mb-[50rem] text-3xl text-error animate-pulse ${
                        showError ? "" : "invisible"
                    } `}
                    onClick={() => {
                        setShowError(false);
                    }}
                >
                    ERROR: No bitches detected. Try again in a bit!
                </p>
                {displayCutterUI && (
                    <span style={{ paddingBottom: "5px" }} id="current-time">
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
                            className="input input-bordered rounded-none input-primary p-4 w-1/6"
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
                            className="input input-bordered rounded-none input-primary p-4 w-1/6"
                        />
                    </div>
                    <div className="btn-group mt-10">
                        <input
                            id="mp3_btn"
                            type="radio"
                            name="options"
                            data-title="MP3"
                            className="btn"
                            checked
                        />
                        <input
                            id="wav_btn"
                            type="radio"
                            name="options"
                            data-title="WAV"
                            className="btn"
                        />
                    </div>
                    <button
                        className="btn mt-10 rounded-none w-1/4 bg-accent"
                        onClick={handleCutVideoClick}
                    >
                        &#x2694;&nbsp;&nbsp;&nbsp;CUT&nbsp;&nbsp;&nbsp;&#x2694;
                    </button>
                </div>
            </div>
            <Disclaimer />
        </div>
    );
}

export default App;
