import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import drakeIceSpice from "./assets/Ice-Spice-Drake.jpeg";
import axios from "axios";
import YoutubePlayer from "./components/YoutubePlayer";
import Waveform from "./components/Waveform";

function App() {
    const [iceSpiceMode, setIceSpiceMode] = useState(false);
    const [ytURL, setYtURL] = useState("");
    const [loadYT, setLoadYT] = useState(false);
    const [getMessage, setGetMessage] = useState({});

    useEffect(() => {
        axios
            .get("http://127.0.0.1:5000/flask/hello")
            .then((response) => {
                console.log("SUCCESS", response);
                setGetMessage(response);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const sendPostRequest = async () => {
        try {
            const response = await fetch("https://httpbin.org/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: ytURL }),
            });

            if (!response.ok) {
                throw new Error("Request failed");
            }

            // Handle the response if needed
            const data = await response.json();
            console.log(data);
        } catch (error) {
            // Handle any errors that occur during the request
            console.error(error);
        }
    };

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
                    <div className="w-full h-full flex flex-col  justify-center items-center backdrop-brightness-50 backdrop-blur-sm ">
                        <div className=" flex flex-row items-center space-x-3 w-full max-w-2xl mb-5">
                            <input
                                type="text"
                                placeholder="Paste Youtube link here"
                                className="input input-bordered input-secondary input-lg grow"
                                onChange={(e) => setYtURL(e.target.value)}
                            />
                            <button
                                className=" btn btn-lg btn-primary"
                                onClick={() => sendPostRequest()}
                            >
                                Trim
                            </button>
                        </div>
                        <div className=" flex flex-row items-center space-x-3 w-full max-w-2xl mb-5"></div>
                        <Waveform />
                        {/* {loadYT && <YoutubePlayer ytURL={ytURL} />} */}
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
            <p>React + Flask Tutorial</p>
            <div>
                {getMessage.status === 200 ? (
                    <h3>{getMessage.data.message}</h3>
                ) : (
                    <h3>LOADING</h3>
                )}
            </div>
        </div>
    );
}

export default App;
