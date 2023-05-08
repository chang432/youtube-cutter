import { useState } from "react";
import reactLogo from "./assets/react.svg";
import drakeIceSpice from "./assets/Ice-Spice-Drake.jpeg"
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className=" max-w-screen-2xl mx-auto">
            <div className="navbar bg-primary text-primary-content rounded-2xl">
                <a className="btn btn-ghost text-xl ">
                    Youtube Cutter MP3 Slicer Time Segmenter Downloader To MP3
                    Converter 4K Type Beat Video Song Audio Drake Ice Spice
                </a>
                <img src={drakeIceSpice} />
            </div>
            <div className=" flex flex-col justify-center h-screen items-center">
                <input
                    type="text"
                    placeholder="Paste Youtube link here"
                    className="input input-bordered input-secondary w-full max-w-2xl input-lg "
                />
            </div>
            <p className=" text-6xl">Testing</p>
        </div>
    );
}

export default App;
