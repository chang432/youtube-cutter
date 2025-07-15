import React from 'react';

const DisclaimerDialog = ({ setShowDisclaimerDialog }) => {

    return (
        <div>
            <div className="fixed inset-0 z-[9998] bg-gray-300 opacity-50">
            </div>
            <div className="fixed inset-1/2 xs:w-1/2 w-3/4 h-fit transfrom -translate-x-1/2 -translate-y-1/2 z-[9999] border border-black bg-white flex flex-col justify-center items-center xs:py-10 py-2 xs:px-20 px-4 text-center leading-tight xs:text-lg text-xs">
                <div className="mb-8 flex flex-row">
                    <p>
                        Users should only convert and download content for which they
                        have the legal right or permission to do so. The functionality
                        of this website is published in good faith and for general
                        purpose only. We are not liable for the actions you take on this
                        website. We are also not liable for any losses or damages in
                        connection with the use of our website. By using Wav Ninja, you
                        hereby consent to our disclaimer and agree to its terms.
                    </p>
                </div>
                <button className="bg-black text-white w-20 h-10" onClick={() => {setShowDisclaimerDialog(false)}}>Exit</button>
            </div>
        </div>
    );
};

export default DisclaimerDialog;