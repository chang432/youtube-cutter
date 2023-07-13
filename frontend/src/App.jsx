import { useState, useEffect, useRef } from "react";
import reactLogo from "./assets/react.svg";
import axios from "axios";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js'

function App() {
    const [iceSpiceMode, setIceSpiceMode] = useState(false);
    const [getMessage, setGetMessage] = useState({})
    const [audioSrc, setAudioSrc] = useState("");
    const [cutAudioSrc, setCutAudioSrc] = useState("");
    const [fullDownloadYoutubeId, setFullDownloadYoutubeId] = useState('');
    const [startTime, setStartTime] = useState('00:00:00');
    const [endTime, setEndTime] = useState('00:00:00');
    const [displayCutterUI, setDisplayCutterUI] = useState(false);
    const [displayCutterAudioPlayer, setDisplayCutterAudioPlayer] = useState(false);
    const waveSurferRef = useRef(null);
    const [waver, setWaver] = useState(null);

    useEffect(()=>{
        axios.get('http://127.0.0.1:5000/flask/hello').then(response => {
        console.log("SUCCESS", response)
        setGetMessage(response)
        }).catch(error => {
            console.log(error)
        })
    }, [])

    function convertYoutubeUrlToId(url) {
        var youtube_id = url
        if (url.includes("youtube")) {
            youtube_id = url.substring(url.indexOf("watch?v=")+8)
        }
        console.log("youtube id is: " + youtube_id)
        return youtube_id
    }

    useEffect(() => {
        if (audioSrc) {
            // Instantiate WaveSurfer
            console.log(waveSurferRef.current)
            const wavesurfer = WaveSurfer.create({
                container: waveSurferRef.current,
                waveColor: "violet",
                progressColor: "purple",
                // ...other WaveSurfer options
            });

            // Load audio source
            wavesurfer.load(audioSrc);

            // Add a region
            const wsRegions = wavesurfer.registerPlugins([RegionsPlugin.create()])

            wavesurfer.on("ready", function () {
                try {
                    setStartTime(formatSeconds(0));
                    setEndTime(formatSeconds(wavesurfer.getDuration()));
                } catch (e) {
                    console.error(e)
                }

                wsRegions.addRegion({
                    start: 0, // Start time in seconds
                    end: 60, // End time in seconds
                    color: 'rgba(255, 0, 0, 0.3)', // Region color
                    drag: true, // Enable dragging the region
                    resize: true // Enable resizing the region
                });
            });

            wsRegions.on("region-updated", function (region) {
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
                    document.getElementById('current-time').innerText = formatSeconds(wavesurfer.getCurrentTime())
                } catch (e) {
                    console.error(e)
                }
            });

            setWaver(wavesurfer);
        }
    }, [audioSrc]);

    function formatSeconds(time) {
        var hours = Math.floor(time / 3600).toString()
        if (hours.length == 1) {
            hours = "0" + hours
        }
        if (hours.length > 2 || hours.length < 1) {
            throw Error("hours cannot be greater than 99 or empty!")
        } else if (!/^\d+$/.test(hours)) {
            throw Error("hours must be an integer!")
        }

        var minutes = (Math.floor(time / 60) - hours*60).toString()
        if (minutes.length == 1) {
            minutes = "0" + minutes
        }
        if (!/^\d+$/.test(minutes)) {
            throw Error("minutes must be an integer!")
        } else if (parseInt(minutes) < 0 || parseInt(minutes) > 60) {
            throw Error("minutes are invalid!")
        }

        var seconds = Math.floor(time % 60).toString()
        if (seconds.length == 1) {
            seconds = "0" + seconds
        }
        if (!/^\d+$/.test(seconds)) {
            throw Error("seconds must be an integer!")
        } else if (parseInt(seconds) < 0 || parseInt(seconds) > 60) {
            throw Error("seconds are invalid!")
        }

        return hours + ":" + minutes + ":" + seconds
    }

    function unformatSeconds(formatted_time) {
        
    }

    function testClick() {
        waver?.playPause();
    }

    function handleFullVideoClick() {
        console.log("Displaying full video")

        var youtube_id = convertYoutubeUrlToId(fullDownloadYoutubeId)

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
            setAudioSrc(location.url);
            setDisplayCutterUI(true)
        })
        .catch((error) => {
            console.log("axios error:", error);
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
        var audio_type = document.getElementById("mp3_btn").checked ? "MP3" : "WAV"
        
        console.log("downloading cut video in " + audio_type + " form")

        var youtube_id = convertYoutubeUrlToId(fullDownloadYoutubeId)

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
            setDisplayCutterAudioPlayer(true)

            // Download video
            const link = document.createElement('a');
            link.href = res.data.url;
            link.download = audio_type ? "test.mp3" : "test.wav"
            link.click();
        })
        .catch((error) => {
            console.log("axios error:", error);
        });
    }

    function handleTestClick() {
        console.log("Testing")
        axios({
            url: "http://127.0.0.1:5000/test",
            method: "post",
            responseType: "text",
            data: {
                yt_id: "F35291LbOMM",
            }
        })
        .then((res) => {
            console.log("test complete")
        })
        .catch((error) => {
            console.log("axios error:", error);
        });
    }

    return (
        <div className="  mx-auto ">
            <div className="navbar bg-secondary text-primary-content drop-shadow-2xl">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl ">Youtube Downloader</a>
                </div>
            </div>

            <div className=" flex flex-col justify-center h-screen items-center">
                <input
                    type="text"
                    value={fullDownloadYoutubeId}
                    onChange={handleFullVideoTextChange}
                    placeholder="Paste Youtube link here"
                    className="input input-bordered input-secondary w-full max-w-2xl input-lg  "
                />
                <button className="btn mt-5" onClick={handleFullVideoClick}>DISPLAY</button>
                {displayCutterUI && <div ref={waveSurferRef} style={{ width: '80%', height: '20%', border: '1px solid black' }}/>}
                {displayCutterUI && <button className="btn mt-5" onClick={testClick}>PLAY/PAUSE</button>}
                {displayCutterUI && <span id="current-time">00:00:00</span>}
                <div className="mt-5" hidden={!displayCutterUI}>
                    <label>
                        START TIME:
                        <input 
                            type="text"
                            value={startTime}
                            onChange={handleStartTimeTextChange}
                            className= "input input-bordered input-primary p-8 "
                        />
                    </label>
                    <label>
                        END TIME:
                        <input 
                            type="text" 
                            value={endTime}
                            onChange={handleEndTimeTextChange}
                            className= "input input-bordered input-primary p-8 "
                        />
                    </label>
                </div>
                {displayCutterUI && 
                <div> 
                    <div className="btn-group">
                        <input id="mp3_btn" type="radio" name="options" data-title="MP3" className="btn" checked />
                        <input id="wav_btn" type="radio" name="options" data-title="WAV" className="btn" />
                    </div>
                    <button className="btn mt-5" onClick={handleCutVideoClick}>CUT</button>
                </div>
                }
                {displayCutterAudioPlayer &&
                <audio className="mt-5" id="cut_audio" controls src={cutAudioSrc} />}
            </div>
        </div>
    );
}

export default App;
