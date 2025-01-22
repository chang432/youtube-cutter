import React, { useState } from "react";
import { Slider } from "antd" ;

const FrequencySlider = ({freqRange, setFreqRange, freqLimit}) => {
    function onSliderChange(value) {
        if (value[0] >= value[1]) {
            return;
        }

        setFreqRange([value[0],value[1]])
    }

    return (
        <div className="flex flex-col items-center w-56">
            <div className="flex flex-row justify-between w-full items-center">
                {/* <p>{Math.round(freqFloor / 100 * freqLimit)}Hz</p>
                <p>{Math.round(freqCeiling / 100 * freqLimit)}Hz</p> */}
                <p>{freqRange[0]}Hz</p>
                <p>{freqRange[1]}Hz</p>
            </div>
            <Slider
                className="flex flex-col items-center w-full" 
                range 
                defaultValue={[0, freqLimit]}
                max={freqLimit}
                value={freqRange}
                tooltip={{ open: false }} // Disables the tooltip
                onChange={onSliderChange}
            >
            </Slider>
        </div>
    );
};

export default FrequencySlider;
