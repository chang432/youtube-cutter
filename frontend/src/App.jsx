import { useState } from "react";
import reactLogo from "./assets/react.svg";
import drakeIceSpice from "./assets/Ice-Spice-Drake.jpeg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
    const [iceSpiceMode, setIceSpiceMode] = useState(false);

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
        </div>
    );
}

export default App;
