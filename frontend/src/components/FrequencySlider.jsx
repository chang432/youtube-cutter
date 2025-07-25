import React, { useRef, useState, useEffect } from "react";
import { Slider, ConfigProvider } from "antd" ;

const FrequencySlider = ({freqRange, setFreqRange, freqLimit}) => {
    const [freqRangeText, setFreqRangeText] = useState([freqRange[0], freqRange[1]]);
    const freqRangeTextRef = useRef([freqRangeText[0], freqRangeText[1]]);
    const functionalityHighlightColor = "#dc2626";  
    const functionalityDefaultColor = "#000000";  
    let clickedInsideLowCutInputBox = { value: false };
    let clickedInsideHighCutInputBox = { value: false };

    function handleLowCutInputChange(event) {
        setFreqRangeText([parseInt(event.target.value), freqRangeText[1]]);
        // console.log("Input changed to " + freqRangeText);
    }

    function handleHighCutInputChange(event) {
        setFreqRangeText([freqRangeText[0], parseInt(event.target.value)]);
    }

    function keydownEnterEventHandler(event, isLowCut) {
        if (event.key === "Enter") {
            // console.log("enter pressed");
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
            // console.log("outside input box pressed");

            if (isLowCut) {
                // console.log("Setting freq range to " + freqRangeTextRef.current[0] + " " + freqRange[1]);
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
            // console.log("inside input box clicked");
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
            // console.log("inside input box clicked");
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
            <div className="flex flex-row justify-between w-full items-center mb-3">
                <input className="border border-black w-12 px-1 focus:outline-none focus:ring-0" type="text" id="lowCutInput" defaultValue={0} value={freqRangeText[0]} onChange={handleLowCutInputChange}/>
                <input className="border border-black w-12 px-1 focus:outline-none focus:ring-0" type="text" id="highCutInput" defaultValue={freqLimit} value={freqRangeText[1]} onChange={handleHighCutInputChange}/>
            </div>
            <ConfigProvider
                theme={{
                    components: {
                        Slider: {
                            trackBg: functionalityDefaultColor,
                            trackHoverBg: functionalityDefaultColor,
                            handleColor: functionalityHighlightColor,
                            handleActiveColor: functionalityHighlightColor,
                            handleActiveOutlineColor: functionalityHighlightColor,
                            handleSizeHover: 2                        
                        }
                    },
                    token: {
                        colorPrimaryBorderHover: functionalityHighlightColor
                    }
                }}
            >
                <Slider
                    className="flex flex-row justify-center items-center w-52"
                    range 
                    defaultValue={[0, freqLimit]}
                    max={freqLimit}
                    value={freqRange}
                    tooltip={{ open: false }} // Disables the tooltip
                    onChange={(value) => {setFreqRange([value[0],value[1]]);setFreqRangeText([value[0],value[1]])}}
                >
                </Slider>
            </ConfigProvider>
        </div>
    );
};

export default FrequencySlider;
