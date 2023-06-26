import { useState, useEffect, useRef } from "react";
import reactLogo from "./assets/react.svg";
import drakeIceSpice from "./assets/Ice-Spice-Drake.jpeg";
import axios from "axios";
import WaveSurfer from "wavesurfer.js";

function App() {
    const [iceSpiceMode, setIceSpiceMode] = useState(false);
    const [getMessage, setGetMessage] = useState({})
    const [audioSrc, setAudioSrc] = useState("");
    const [cutAudioSrc, setCutAudioSrc] = useState("");
    const [fullDownloadYoutubeId, setFullDownloadYoutubeId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [displayCutterUI, setDisplayCutterUI] = useState(false);
    const [displayCutterAudioPlayer, setDisplayCutterAudioPlayer] = useState(false);
    const waveSurferRef = useRef(null);

    useEffect(()=>{
        axios.get('http://127.0.0.1:5000/flask/hello').then(response => {
        console.log("SUCCESS", response)
        setGetMessage(response)
        }).catch(error => {
        console.log(error)
        })
    }, [])

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
    }
    }, [audioSrc]);

    // const handleButtonClick = (url) => {
    //     const waveform = WaveSurfer.create({
    //         container: waveformRef.current,
    //         waveColor: "violet",
    //         progressColor: "purple",
    //     });

    //     waveform.load(url);
    // };

    function handleFullVideoClick() {
        console.log("Displaying full video")
        axios({
            url: "http://127.0.0.1:5000/handle_full",
            method: "post",
            responseType: "json",
            data: {
                yt_id: fullDownloadYoutubeId,
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
        console.log("downloading cut video")
        axios({
            url: "http://127.0.0.1:5000/handle_cut",
            method: "post",
            responseType: "json",
            data: {
                yt_id: fullDownloadYoutubeId,
                start_time: startTime,
                end_time: endTime
            }
        })
        .then((res) => {
            // Display
            console.log("return post: " + res.data)
            setCutAudioSrc(res.data.url);
            setDisplayCutterAudioPlayer(true)

            // Download video
            // const link = document.createElement('a');
            // link.href = res.data;
            // link.download = "test.mp3";
            // link.click();
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
                <div className="w-full h-full flex flex-col  justify-center items-center backdrop-brightness-50 backdrop-blur-sm ">
                    <input
                        type="text"
                        value={fullDownloadYoutubeId}
                        onChange={handleFullVideoTextChange}
                        placeholder="Paste Youtube link here"
                        className="input input-bordered input-secondary w-full max-w-2xl input-lg  "
                    />
                    <button className="btn mt-5" onClick={handleFullVideoClick}>DISPLAY</button>
                    {displayCutterUI && <div ref={waveSurferRef} />}
                    <audio className="mt-5" id="audio" hidden={!displayCutterUI} controls src={audioSrc} />
                    {/* {displayCutterUI && <Waveform audioSrc={audioSrc}></Waveform>} */}
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
                    <button className="btn mt-5" onClick={handleCutVideoClick}>CUT</button>}
                    {displayCutterAudioPlayer &&
                    <audio className="mt-5" id="cut_audio" controls src={cutAudioSrc} />}
                </div>
                {/* <img className=" bg-cover blur-lg" src={drakeIceSpice} />
                <input
                    type="text"
                    placeholder="Paste Youtube link here"
                    className="input input-bordered input-secondary w-full max-w-2xl input-lg "
                /> */}
            </div>
        </div>
    );
}

export default App;
