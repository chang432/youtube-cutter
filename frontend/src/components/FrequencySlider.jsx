import React, { useState } from "react";

const FrequencySlider = ({freqFloor, setFreqFloor, freqCeiling, setFreqCeiling, freqLimit}) => {
  const [draggingKnob, setDraggingKnob] = useState(null); // Tracks which knob is being dragged
  const percentSpaceBetween = 5; // Minimum space between the knobs

  const handleMouseMove = (e) => {
    if (!draggingKnob) return;

    const slider = document.getElementById("slider");
    const rect = slider.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;

    if (draggingKnob === "min") {
      setFreqFloor(Math.round(Math.min(Math.max(0, position), freqCeiling-percentSpaceBetween)));
    } else if (draggingKnob === "max") {
      setFreqCeiling(Math.round(Math.max(Math.min(100, position), freqFloor+percentSpaceBetween)));
    }
  };

  const handleMouseUp = () => {
    setDraggingKnob(null);
  };

  return (
    <div
      className="flex flex-col items-center w-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
        <div className="flex flex-row w-full justify-between">
            <p>{Math.round(freqFloor / 100 * freqLimit)}Hz</p>
            <p>{Math.round(freqCeiling / 100 * freqLimit)}Hz</p>
        </div>
        <div id="slider" className="relative w-64 max-w-md h-4 bg-gray-300">
            {/* FrequencySlider Track */}
            <div
            className="absolute h-4 bg-blue-500 pointer-events-none"
            style={{
                left: `${freqFloor}%`,
                width: `${freqCeiling - freqFloor}%`,
            }}
            ></div>

            {/* Left Knob */}
            <div
            className="absolute top-0 h-8 w-2 bg-blue-700 cursor-pointer rounded"
            style={{ left: `${freqFloor}%`, transform: "translateX(-50%)" }}
            onMouseDown={() => setDraggingKnob("min")}
            ></div>

            {/* Right Knob */}
            <div
            className="absolute top-0 h-8 w-2 bg-blue-700 cursor-pointer rounded"
            style={{ left: `${freqCeiling}%`, transform: "translateX(-50%)" }}
            onMouseDown={() => setDraggingKnob("max")}
            ></div>
        </div>
    </div>
  );
};

export default FrequencySlider;
