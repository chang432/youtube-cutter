import React, { useState, useEffect } from "react";
import YouTube from "react-youtube";

const YoutubePlayer = ({ ytURL }) => {
    const [player, setPlayer] = useState(null);

    // const startTine = 10;
    // const endTime = 25;

    const onPlayerReady = (e) => {
        setPlayer(e.target);
        console.log(player.getDuration());
        // player.seekTo(startTine);
        // player.playVideo();
        // player.pauseVideo();
    };

    const onPlayHandler = () => {
        player.playVideo();
    };
    const onPauseHandler = () => {
        player.pauseVideo();
    };

    // function restartVideoSection() {
    //     player.seekTo(startTine);
    // }

    // function onPlayerStateChange(event) {
    //     if (event.data == YouTube.PlayerState.PLAYING) {
    //         var duration = startTine - endTime;
    //         setTimeout(restartVideoSection, duration * 1000);
    //     }
    // }

    // const onEndHandler = () => {
    //     player.seek;
    // };

    // const onPlayerStateChange = (event) => {
    //     const player = event.target;
    //     player.playVideo();
    // };

    const options = {
        height: "400",
        width: "800",
        playerVars: {
            controls: 1,
            // showinfo: 0, // Hide the video title
            // loop: 1,
            // playlist: "d4YsSqPJo1I",
        },
    };
    return (
        <div>
            {/* <YouTube
                videoId="d4YsSqPJo1I"
                opts={options}
                onReady={onPlayerReady}
                className=""
                // onStateChange={onPlayerStateChange}
            /> */}
            {/* <button onClick={onPlayHandler} className="btn">
                Play
            </button>
            <button onClick={onPauseHandler} className="btn">
                Pause
            </button> */}
        </div>
    );
};

export default YoutubePlayer;
