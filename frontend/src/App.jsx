import { useState, useEffect, useRef } from "react";
import reactLogo from "./assets/react.svg";
import axios from "axios";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js'
import LoadingBar from './components/LoadingBar';

function App() {
    const developMode = false;
    const [iceSpiceMode, setIceSpiceMode] = useState(false);
    const [getMessage, setGetMessage] = useState({})
    const [audioSrc, setAudioSrc] = useState("");
    const [cutAudioSrc, setCutAudioSrc] = useState("");
    const [fullDownloadYoutubeId, setFullDownloadYoutubeId] = useState('');
    const [startTime, setStartTime] = useState('00:00:00');
    const [endTime, setEndTime] = useState('00:00:00');
    const [displaySearchUI, setDisplaySearchUI] = useState(true)
    const [displayCutterUI, setDisplayCutterUI] = useState(false);
    const waveSurferRef = useRef(null);
    const [waver, setWaver] = useState(null);
    const [waverRegion, setWaverRegion] = useState(null);
    const [endDuration, setEndDuration] = useState(0);
    let clickedInsideStartInputBox = false;
    let clickedInsideEndInputBox = false;

    const [showLoader, setShowLoader] = useState(false);

    const waverRegionRef = useRef(waverRegion);
    const startTimeRef = useRef(startTime);
    const endTimeRef = useRef(endTime);

    useEffect(() => {
        startTimeRef.current = startTime; 
        if (startTimeRef.current >= endTimeRef.current) {
            moveStartOrEndToNotOverlap()
        }
    }, [startTime]);

    useEffect(() => {
        endTimeRef.current = endTime; 
        if (startTimeRef.current >= endTimeRef.current) {
            moveStartOrEndToNotOverlap()
        }
    }, [endTime]);

    useEffect(() => {
        waverRegionRef.current = waverRegion;
    }, [waverRegion]);

    function convertYoutubeUrlToId(url) {
        let youtube_id = url
        if (url.includes("youtube")) {
            youtube_id = url.substring(url.indexOf("watch?v=")+8)
        }
        console.log("youtube id is: " + youtube_id)
        return youtube_id
    }

    useEffect(() => {
        // developing use for going straight to the cutter ui without having to paste in a youtube url]
        if (developMode) {
            setDisplaySearchUI(false)
            setAudioSrc("https://youtube-cutter-static-files.s3.amazonaws.com/audio/tGTKY1dpo_E.mp3");
            setDisplayCutterUI(true)
        }
    }, []);

    useEffect(() => {
        let inputElement = document.getElementById("startTimeInput");

        inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                console.log("startTimeInput enter pressed: " + startTimeRef.current + ", " + waverRegionRef.current)
                waverRegionRef.current.update({start: unformatSeconds(startTimeRef.current)})
            }
        });

        inputElement.addEventListener('click', () => {
            clickedInsideStartInputBox = true;
        });

        document.addEventListener('click', (event) => {
            if (!inputElement.contains(event.target) && clickedInsideStartInputBox) {
                // Execute your code here
                console.log("startTimeInput outside input box pressed: " + startTimeRef.current + ", " + waverRegionRef.current)
                waverRegionRef.current.update({start: unformatSeconds(startTimeRef.current)})

                clickedInsideStartInputBox = false
            }
        });
    }, []);

    useEffect(() => {
        let inputElement = document.getElementById("endTimeInput");

        inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                console.log("endTimeInput enter pressed: " + endTimeRef.current + ", " + waverRegionRef.current)
                waverRegionRef.current.update({end: unformatSeconds(endTimeRef.current)})
            }
        });

        inputElement.addEventListener('click', () => {
            clickedInsideEndInputBox = true;
        });

        document.addEventListener('click', (event) => {
            if (!inputElement.contains(event.target) && clickedInsideEndInputBox) {
                // Execute your code here
                console.log("endTimeInput outside input box pressed: " + endTimeRef.current + ", " + waverRegionRef.current)
                waverRegionRef.current.update({end: unformatSeconds(endTimeRef.current)})

                clickedInsideEndInputBox = false
            }
        });
    }, []);

    // The following adjusts the wavesurfer region to match the start and end time exactly because sometimes its slightly off
    useEffect(() => {
        if (waverRegion) {
            let inputElement = document.getElementsByClassName('wavesurfer-region')[0];

            inputElement.addEventListener('mousedown', () => {
                document.addEventListener('mouseup', handleMouseUp);
            });

            function handleMouseUp() {
                waverRegionRef.current.update({start: unformatSeconds(startTimeRef.current), end: unformatSeconds(endTimeRef.current)})
                document.removeEventListener('mouseup', handleMouseUp);
            }
        }
    }, [waverRegion]);

    useEffect(() => {
        if (audioSrc) {
            // Instantiate WaveSurfer
            console.log(waveSurferRef.current)
            const wavesurfer = WaveSurfer.create({
                container: waveSurferRef.current,
                waveColor: "black",
                progressColor: "lightblack",
                barWidth: 2,
                barGap: 1,
                barRadius: 2,
            });

            // Load audio source
            wavesurfer.load(audioSrc);

            // Add a region
            wavesurfer.registerPlugins([RegionsPlugin.create()])

            wavesurfer.on("ready", function () {
                let end_duration = wavesurfer.getDuration()

                try {
                    setStartTime(formatSeconds(0));
                    setEndTime(formatSeconds(end_duration/4));
                } catch (e) {
                    console.error(e)
                }

                const wsRegion = wavesurfer.addRegion({
                    start: 0, // Start time in seconds
                    end: end_duration/4, // End time in seconds
                    color: 'rgba(255, 0, 0, 0.3)', // Region color
                    drag: true, // Enable dragging the region
                    resize: true // Enable resizing the region
                });

                setEndDuration(end_duration)
                setWaverRegion(wsRegion)
            });

            wavesurfer.on("region-updated", function (region) {
                setStartTime(formatSeconds(region.start))
                setEndTime(formatSeconds(region.end))
            })

            wavesurfer.on("interaction", function () {
                try {
                    setTimeout(() => {
                        document.getElementById('current-time').innerText = formatSeconds(wavesurfer.getCurrentTime())
                    }, 0);
                } catch (e) {
                    console.error(e)
                }
            });

            wavesurfer.on("audioprocess", function () {
                try {
                    // if playhead hits endTime locator, loop around
                    if (Math.trunc(wavesurfer.getCurrentTime()) == unformatSeconds(endTimeRef.current)) {
                        wavesurfer.setCurrentTime(unformatSeconds(startTimeRef.current))
                    }
                    
                    document.getElementById('current-time').innerText = formatSeconds(wavesurfer.getCurrentTime())
                } catch (e) {
                    console.error(e)
                }
            });

            setWaver(wavesurfer);
        }
    }, [audioSrc]);

    function moveStartOrEndToNotOverlap() {
        if (waverRegionRef.current) {
            let endDurationWhole = Math.floor(endDuration)
            let endTimeSeconds = unformatSeconds(endTimeRef.current)
            let startTimeSeconds = unformatSeconds(startTimeRef.current)
            console.log(endTimeSeconds + ", " + endDurationWhole)
            if (endTimeSeconds < endDurationWhole) {
                waverRegionRef.current.update({end: startTimeSeconds+1})
            } else {
                waverRegionRef.current.update({start: endTimeSeconds-1}) 
            }
        }
    }

    function strIsNotNumber(str) {
        if (/^\d+$/.test(str)) {
            return false
        }
        return true
    }

    function formatSeconds(time) {
        // X seconds -> HH:MM:SS

        let hours = Math.floor(time / 3600).toString()
        if (hours.length == 1) {
            hours = "0" + hours
        }
        if (hours.length > 2 || hours.length < 1) {
            throw Error("hours cannot be greater than 99 or empty!")
        } else if (strIsNotNumber(hours)) {
            throw Error("hours must be an integer!")
        }

        let minutes = (Math.floor(time / 60) - hours*60).toString()
        if (minutes.length == 1) {
            minutes = "0" + minutes
        }
        if (strIsNotNumber(minutes)) {
            throw Error("minutes must be an integer!")
        } else if (parseInt(minutes) < 0 || parseInt(minutes) > 60) {
            throw Error("minutes are invalid!")
        }

        let seconds = Math.floor(time % 60).toString()
        if (seconds.length == 1) {
            seconds = "0" + seconds
        }
        if (strIsNotNumber(seconds)) {
            throw Error("seconds must be an integer!")
        } else if (parseInt(seconds) < 0 || parseInt(seconds) > 60) {
            throw Error("seconds are invalid!")
        }

        return hours + ":" + minutes + ":" + seconds
    }

    function unformatSeconds(formatted_time) {
        // HH:MM:SS -> X seconds
        let times = formatted_time.split(":")
        if (strIsNotNumber(times[0]) || strIsNotNumber(times[1]) || strIsNotNumber(times[2])) {
            throw Error("one of the hours, minutes, or seconds are not formatted correctly")
        }
        
        let hours = parseInt(times[0])
        let minutes = parseInt(times[1])
        let seconds = parseInt(times[2])
        return hours*3600 + minutes*60 + seconds
    }

    function playPauseClick() {
        waver?.playPause();
    }

    function playLoopClick() {
        waver?.setCurrentTime(unformatSeconds(startTimeRef.current))
        waver?.play();
    }

    function handleFullVideoClick() {
        console.log("Displaying full video")
        setDisplaySearchUI(false)
        setShowLoader(true)        

        let youtube_id = convertYoutubeUrlToId(fullDownloadYoutubeId)

        axios({
            url: "http://127.0.0.1:5000/handle_full",
            method: "post",
            responseType: "json",
            data: {
                yt_id: youtube_id,
            }
        })
        .then((res) => {
            // console.log("return post: " + res.data)
            const location = res.data;
            console.log(location)
            setShowLoader(false)
            setAudioSrc(location.url);
            setDisplayCutterUI(true)
        })
        .catch((error) => {
            console.log("axios error:", error);
            setShowLoader(false)
            setDisplaySearchUI(true)
            alert("Server error...try again and if it still persists, please let us know!")
        });
    }

    const handleFullVideoTextChange = (event) => {
        setFullDownloadYoutubeId(event.target.value);
    };

    const handleStartTimeTextChange = (event) => {
        setStartTime(event.target.value);
    };

    const handleEndTimeTextChange = (event) => {
        setEndTime(event.target.value);
    };

    function handleCutVideoClick() {
        setDisplayCutterUI(false)
        setShowLoader(true)

        let audio_type = document.getElementById("mp3_btn").checked ? "MP3" : "WAV"
        
        console.log("downloading cut video in " + audio_type + " form")

        let youtube_id = convertYoutubeUrlToId(fullDownloadYoutubeId)

        axios({
            url: "http://127.0.0.1:5000/handle_cut",
            method: "post",
            responseType: "json",
            data: {
                yt_id: youtube_id,
                start_time: startTime,
                end_time: endTime,
                audio_type: audio_type,
            }
        })
        .then((res) => {
            // Display
            console.log("return post: " + res.data)
            setCutAudioSrc(res.data.url);

            // Download video
            const link = document.createElement('a');
            link.href = res.data.url;
            link.download = audio_type ? "test.mp3" : "test.wav"

            // Use the onload event to trigger cleanup after download
            link.addEventListener('click', () => {
                axios.post('http://127.0.0.1:5000/cleanup', {
                    yt_id: youtube_id
                }, {
                    responseType: 'json'
                });
            });
            
            link.click();

            return
        })
        .then(() => {
            setShowLoader(false)
            setDisplaySearchUI(true)
        })
        .catch((error) => {
            console.log("axios error:", error);
            alert("Server error...try again and if it still persists, please let us know!")
        });
    }

    return (
        <div className="  mx-auto ">
            <div className=" flex flex-col justify-center h-screen items-center">
                {showLoader && <LoadingBar showLoader={showLoader} />}
                {displaySearchUI && <div className="flex flex-col justify-center items-center w-full">
                    <input
                        type="text"
                        value={fullDownloadYoutubeId}
                        onChange={handleFullVideoTextChange}
                        placeholder="Paste Youtube link here"
                        className="input input-bordered input-secondary w-full max-w-2xl input-lg  "
                    />
                    <button className="btn mt-5" style={{ marginBottom: '40px' }} onClick={handleFullVideoClick}>DISPLAY</button>
                </div>}
                {displayCutterUI && <span style={{ paddingBottom: '5px' }} id="current-time">00:00:00</span>}
                <div hidden={!displayCutterUI} id="waveform" ref={waveSurferRef} style={{ width: '80%' }}/>
                <div className={`flex flex-col justify-center items-center w-full ${displayCutterUI ? '' : 'hidden'} mt-10`}> 
                    <div className="w-4/5 flex flex-row justify-between">
                        <input 
                            id="startTimeInput"
                            type="text"
                            value={startTime}
                            onChange={handleStartTimeTextChange}
                            className= "input input-bordered rounded-none input-primary p-4 w-1/6"
                        />
                        <div>
                            <button className="btn mr-5 rounded-none bg-secondary" onClick={playPauseClick}>PLAY/PAUSE</button>
                            <button className="btn ml-5 rounded-none bg-secondary" onClick={playLoopClick}>PLAY_LOOP</button>
                        </div>
                        <input 
                            id="endTimeInput"
                            type="text" 
                            value={endTime}
                            onChange={handleEndTimeTextChange}
                            className= "input input-bordered rounded-none input-primary p-4 w-1/6"
                        />
                    </div>
                    <div className="btn-group mt-10">
                        <input id="mp3_btn" type="radio" name="options" data-title="MP3" className="btn" checked />
                        <input id="wav_btn" type="radio" name="options" data-title="WAV" className="btn" />
                    </div>
                    <button className="btn mt-10 rounded-none w-1/4 bg-accent" onClick={handleCutVideoClick}>CUT</button>
                </div>
            </div>
        </div>
    );
}

export default App;
