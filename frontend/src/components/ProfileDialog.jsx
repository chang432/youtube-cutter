import React, { useState } from 'react';

const ProfileDialog = ({ setShowProfileDialog }) => {
    const [showSteps, setShowSteps] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    function handleKofiTextClicked() {
        window.open("https://ko-fi.com/wavninja", "_blank");
    }

    return (
        <div>
            <div className="fixed inset-0 z-[9998] bg-gray-300 opacity-50"></div>
            <div className="fixed inset-1/2 xs:w-1/2 w-3/4 h-fit transfrom -translate-x-1/2 -translate-y-1/2 z-[9999] border border-black bg-white flex flex-col justify-center items-center xs:py-10 py-2 xs:px-20 px-4 text-center leading-tight xs:text-lg text-xs">
                <div className="mb-8 flex flex-row">
                    <p>
                        <span className="text-red-600">Help us pay for server costs</span>
                        {" with a monthly donation of $3!"}
                    </p>
                </div>
                <p className="mb-10">Get access to additional editing tools while cutting to modify speed, frequency, and reverse audio</p>
                
                {/* Steps Tab */}
                <button
                    className="w-full text-left text-red-600 font-semibold mb-2 focus:outline-none border-b border-gray-300 py-2 flex items-center justify-between"
                    onClick={() => setShowSteps((prev) => !prev)}
                    aria-expanded={showSteps}
                    aria-controls="steps-content"
                    type="button"
                >
                    <span>Instructions</span>
                    <span className="ml-2">{showSteps ? "▲" : "▼"}</span>
                </button>
                {showSteps && (
                    <div id="steps-content" className="text-left mb-10 w-full">
                        <p>
                            1. On our{" "}
                            <span
                                className="hover:cursor-pointer text-red-600 font-bold underline"
                                onClick={handleKofiTextClicked}
                            >
                                Ko-fi page
                            </span>
                            , sign up for a monthly donation with your email account
                        </p>
                        <p>
                            2. Once the sign up has been completed, an email will be automatically sent over containing a personal access key to enable additional features.
                        </p>
                    </div>
                )}

                {/* Notes Tab */}
                <button
                    className="w-full text-left text-red-600 font-semibold mb-2 focus:outline-none border-b border-gray-300 py-2 flex items-center justify-between"
                    onClick={() => setShowNotes((prev) => !prev)}
                    aria-expanded={showNotes}
                    aria-controls="notes-content"
                    type="button"
                >
                    <span>Notes</span>
                    <span className="ml-2">{showNotes ? "▲" : "▼"}</span>
                </button>
                {showNotes && (
                    <div id="notes-content" className="text-left mb-10 w-full">
                        <p>
                            - The access key only needs to be input once per month as the authentication information will be stored securely as a cookie in your browser for easy access.
                        </p>
                        <p>
                            - Unsubscribe at any time, your access will be valid until the end of the month.
                        </p>
                    </div>
                )}

                <button
                    className="bg-black text-white w-20 h-10 mt-10"
                    onClick={() => {
                        setShowProfileDialog(false);
                    }}
                >
                    Exit
                </button>
            </div>
        </div>
    );
};

export default ProfileDialog;