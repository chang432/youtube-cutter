import React, { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
// import "wavesurfer.js/dist/wavesurfer.css";
// import beat from "../assets/beat.mp3";

const Waveform = ({audioSrc}) => {
    const waveformRef = useRef(null);
    const handleButtonClick = () => {
        const waveform = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: "violet",
            progressColor: "purple",
        });

        waveform.load(audioSrc);
    };

    return (
        <div>
            {/* <button onClick={handleButtonClick} className=" btn">
                Generate Waveform
            </button> */}
            <div ref={waveformRef} />
        </div>
    );
    // useEffect(() => {
    //     const waveform = WaveSurfer.create({
    //         container: waveformRef.current,
    //         waveColor: "violet",
    //         progressColor: "purple",
    //     });

    //     waveform.load(beat);

    //     return () => waveform.destroy();
    // }, []);

    // return <div ref={waveformRef} />;
};

export default Waveform;
