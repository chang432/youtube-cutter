import React from "react";

const Disclaimer = ({showDisclaimer, setShowDisclaimer}) => {

    function toggleShowDisclaimer() {
        setShowDisclaimer(!showDisclaimer);
    }

    return (
        <div className="w-full fixed bottom-0 left-0 p-4 mx-auto ">
            <div className="flex justify-between items-center">
                <button onClick={toggleShowDisclaimer}>
                {showDisclaimer ? (
                    <p className="font-extrabold text-red-500">hide</p>
                ) : (
                    "disclaimer"
                )}
                </button>
                <p>
                    contact: wavninja.team@gmail.com
                </p>
            </div>
            {showDisclaimer && <p className="text-center">
                Users should only convert and download content for which they
                have the legal right or permission to do so. The functionality
                of this website is published in good faith and for general
                purpose only. We are not liable for the actions you take on this
                website. We are also not liable for any losses or damages in
                connection with the use of our website. By using Wav Ninja, you
                hereby consent to our disclaimer and agree to its terms.{" "}
            </p>}
        </div>
    );
};

export default Disclaimer;
