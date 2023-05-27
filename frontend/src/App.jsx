import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import drakeIceSpice from "./assets/Ice-Spice-Drake.jpeg";
import viteLogo from "/vite.svg";
import "./App.css";
import axios from 'axios'

function App() {
    const [iceSpiceMode, setIceSpiceMode] = useState(false);
    const [getMessage, setGetMessage] = useState({})
    const [audioSrc, setAudioSrc] = useState("");
    const [cutAudioSrc, setCutAudioSrc] = useState("");
    const [fullDownloadYoutubeId, setFullDownloadYoutubeId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(()=>{
        axios.get('http://127.0.0.1:5000/flask/hello').then(response => {
        console.log("SUCCESS", response)
        setGetMessage(response)
        }).catch(error => {
        console.log(error)
        })
    }, [])

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
                <div
                    onClick={() => {
                        setIceSpiceMode(!iceSpiceMode);
                    }}
                    className=" btn btn-sm mx-5"
                >
                    Ice Spice Mode
                </div>
            </div>

            <div className=" flex flex-col justify-center h-screen items-center">
                <div
                    className={`w-full h-screen bg-cover bg-center bg-primary-focus `}
                    style={{
                        backgroundImage: `url(${
                            iceSpiceMode ? drakeIceSpice : null
                        })`,
                    }}
                >
                    <div className="w-full h-full flex  justify-center items-center backdrop-brightness-50 backdrop-blur-sm ">
                        <input
                            type="text"
                            placeholder="Paste Youtube link here"
                            className="input input-bordered input-secondary w-full max-w-2xl input-lg  "
                        />
                    </div>
                </div>
                {/* <img className=" bg-cover blur-lg" src={drakeIceSpice} />
                <input
                    type="text"
                    placeholder="Paste Youtube link here"
                    className="input input-bordered input-secondary w-full max-w-2xl input-lg "
                /> */}
            </div>
            <p className=" text-6xl">Testing</p>
            <div>
                <div>
                    <button onClick={handleFullVideoClick}>DISPLAY</button>
                </div>
                <label>
                    YouTube ID:
                    <input 
                        type="text" 
                        value={fullDownloadYoutubeId}
                        onChange={handleFullVideoTextChange}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '8px',
                        }}
                    />
                </label>
            </div>
            <div>
                <audio id="audio" controls src={audioSrc} />
            </div>
            <div>
                <button onClick={handleCutVideoClick}>CUT</button>
            </div>
            <div>
                <label>
                    START TIME:
                    <input 
                        type="text" 
                        value={startTime}
                        onChange={handleStartTimeTextChange}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '8px',
                        }}
                    />
                </label>
                <label>
                    END TIME:
                    <input 
                        type="text" 
                        value={endTime}
                        onChange={handleEndTimeTextChange}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '8px',
                        }}
                    />
                </label>
            </div>
            <div>
                <audio id="cut_audio" controls src={cutAudioSrc} />
            </div>
            <div>
                <button onClick={handleTestClick}>TEST</button>
            </div>
            <p>React + Flask Tutorial</p>
            <div>{getMessage.status === 200 ? 
            <h3>{getMessage.data.message}</h3>
            :
            <h3>LOADING</h3>}</div>
        </div>
    );
}

export default App;
