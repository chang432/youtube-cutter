import React, { useRef, useState, useEffect } from "react";
import { Slider } from "antd" ;

const FrequencySlider = ({freqRange, setFreqRange, freqLimit}) => {
    const [freqRangeText, setFreqRangeText] = useState([freqRange[0], freqRange[1]]);
    const freqRangeTextRef = useRef([freqRangeText[0], freqRangeText[1]]);
    let clickedInsideLowCutInputBox = { value: false };
    let clickedInsideHighCutInputBox = { value: false };

    function handleLowCutInputChange(event) {
        setFreqRangeText([parseInt(event.target.value), freqRangeText[1]]);
        console.log("Input changed to " + freqRangeText);
    }

    function handleHighCutInputChange(event) {
        setFreqRangeText([freqRangeText[0], parseInt(event.target.value)]);
    }

    function keydownEnterEventHandler(event, isLowCut) {
        if (event.key === "Enter") {
            console.log(
                "enter pressed"
            );
            if (isLowCut) {
                setFreqRange([freqRangeTextRef.current[0], freqRange[1]]);
            } else {
                setFreqRange([freqRange[0], freqRangeTextRef.current[1]]);
            }
        }
    }

    function outsideInputBoxClickEventHandler(
        event,
        inputElement,
        clickedInsideInputBox,
        isLowCut
    ) {
        if (
            !inputElement.contains(event.target) &&
            clickedInsideInputBox.value
        ) {
            // Execute your code here
            console.log(
                "outside input box pressed"
            );

            if (isLowCut) {
                console.log("Setting freq range to " + freqRangeTextRef.current[0] + " " + freqRange[1]);
                setFreqRange([freqRangeTextRef.current[0], freqRange[1]]);
            } else {
                setFreqRange([freqRange[0], freqRangeTextRef.current[1]]);
            }

            clickedInsideInputBox.value = false;
        }
    }

    useEffect(() => {
        freqRangeTextRef.current = [freqRangeText[0], freqRangeText[1]];
    }, [freqRangeText]);

    useEffect(() => {
        let lowcutInputElement = document.getElementById("lowCutInput");

        const keydownEnterEventHandlerRef = (event) =>
            keydownEnterEventHandler(event, true);
        lowcutInputElement.addEventListener("keydown", keydownEnterEventHandlerRef);

        const insideInputBoxClickEventHandlerRef = () => {
            console.log("inside input box clicked");
            clickedInsideLowCutInputBox.value = true;
        };
        lowcutInputElement.addEventListener(
            "click",
            insideInputBoxClickEventHandlerRef
        );

        const outsideInputBoxClickEventHandlerRef = (event) =>
            outsideInputBoxClickEventHandler(
                event,
                lowcutInputElement,
                clickedInsideLowCutInputBox,
                true
            );
        document.addEventListener("click", outsideInputBoxClickEventHandlerRef);

        return () => {
            // cleanup on unmount
            lowcutInputElement.removeEventListener(
                "keydown",
                keydownEnterEventHandlerRef
            );
            lowcutInputElement.removeEventListener(
                "click",
                insideInputBoxClickEventHandlerRef
            );
            document.removeEventListener(
                "click",
                outsideInputBoxClickEventHandlerRef
            );
        };
    }, []);

    useEffect(() => {
        let highcutInputElement = document.getElementById("highCutInput");

        const keydownEnterEventHandlerRef = (event) =>
            keydownEnterEventHandler(event, false);
        highcutInputElement.addEventListener("keydown", keydownEnterEventHandlerRef);

        const insideInputBoxClickEventHandlerRef = () => {
            console.log("inside input box clicked");
            clickedInsideHighCutInputBox.value = true;
        };
        highcutInputElement.addEventListener(
            "click",
            insideInputBoxClickEventHandlerRef
        );

        const outsideInputBoxClickEventHandlerRef = (event) =>
            outsideInputBoxClickEventHandler(
                event,
                highcutInputElement,
                clickedInsideHighCutInputBox,
                false
            );
        document.addEventListener("click", outsideInputBoxClickEventHandlerRef);

        return () => {
            // cleanup on unmount
            highcutInputElement.removeEventListener(
                "keydown",
                keydownEnterEventHandlerRef
            );
            highcutInputElement.removeEventListener(
                "click",
                insideInputBoxClickEventHandlerRef
            );
            document.removeEventListener(
                "click",
                outsideInputBoxClickEventHandlerRef
            );
        };
    }, []);

    return (
        <div className="flex flex-col items-center w-56">
            <div className="flex flex-row justify-between w-full items-center">
                <input type="text" id="lowCutInput" defaultValue={0} value={freqRangeText[0]} onChange={handleLowCutInputChange}/>
                <input type="text" id="highCutInput" defaultValue={freqLimit} value={freqRangeText[1]} onChange={handleHighCutInputChange}/>
            </div>
            <Slider
                className="flex flex-col items-center w-full" 
                range 
                defaultValue={[0, freqLimit]}
                max={freqLimit}
                value={freqRange}
                tooltip={{ open: false }} // Disables the tooltip
                onChange={(value) => {setFreqRange([value[0],value[1]]);setFreqRangeText([value[0],value[1]])}}
            >
            </Slider>
        </div>
    );
};

export default FrequencySlider;
