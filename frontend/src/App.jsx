import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import drakeIceSpice from "./assets/Ice-Spice-Drake.jpeg";
import viteLogo from "/vite.svg";
import "./App.css";
import axios from 'axios'

function App() {
    const [iceSpiceMode, setIceSpiceMode] = useState(false);
    const [count, setCount] = useState(0);
    const [getMessage, setGetMessage] = useState({})
    const [audioSrc, setAudioSrc] = useState("");

    useEffect(()=>{
        axios.get('http://127.0.0.1:5000/flask/hello').then(response => {
        console.log("SUCCESS", response)
        setGetMessage(response)
        }).catch(error => {
        console.log(error)
        })
    }, [])

    function handleClick() {
        axios({
          url: "http://127.0.0.1:5000/post",
          method: "post",
          responseType: "blob",
        })
          .then((res) => {
            setAudioSrc(URL.createObjectURL(res.data));
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
            <button onClick={handleClick}>BUTTON</button>
            <div>
                <audio id="audio" controls src={audioSrc} />
            </div>
            <div>{getMessage.status === 200 ? 
            <h3>{getMessage.data.message}</h3>
            :
            <h3>LOADING</h3>}</div>
        </div>
    );
}

export default App;
