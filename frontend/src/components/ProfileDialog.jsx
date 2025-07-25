import React, { useState } from 'react';
import axios from "axios";

const ProfileDialog = ({ setShowProfileDialog, setDisablePremium, setShowLoader }) => {
    const [showSteps, setShowSteps] = useState(false);
    const [showBenefits, setshowBenefits] = useState(false);
    const [showProfileDialogContents, setShowProfileDialogContents] = useState(true);

    function handleKofiTextClicked() {
        window.open("https://ko-fi.com/wavninja", "_blank");
    }

    async function passwordEnterPressed() {
        let password = document.getElementById("premiumPasswordInput").value;

        if (password.length != 14) {
            alert("Invalid Password!");
            return;
        }

        setShowLoader(true);
        setShowProfileDialogContents(false);

        axios({
            url: "http://127.0.0.1:5000/login_premium",
            method: "post",
            responseType: "json",
            data: {
                input_password: password,
                testing: false
            },
        })
        .then((res) => {
            let output = res.data;
            let authorized = output.authorized
            setShowLoader(false);
            setShowProfileDialog(false);
            if (!authorized) {
                alert("Invalid Password!");
            } else {
                setDisablePremium(!authorized);
            }
        })
    }

    return (
        <div>
            <div className="fixed inset-0 z-[9998] bg-gray-300 opacity-50"></div>
            { showProfileDialogContents && <div className="fixed inset-1/2 xs:w-1/2 w-3/4 h-fit transfrom -translate-x-1/2 -translate-y-1/2 z-[9999] border border-black bg-white flex flex-col justify-center items-center xs:py-10 py-2 xs:px-20 px-4 text-center leading-tight xs:text-lg text-xs">
                <div className="mb-8 flex flex-row">
                    <p>
                        <span className="text-red-600">Help us pay for server costs</span>
                        {" with a monthly donation of $3 or more!"}
                    </p>
                </div>
                
                {/* Benefits Tab */}
                <button
                    className="w-full text-left text-red-600 font-semibold mb-2 focus:outline-none border-b border-gray-300 py-2 flex items-center justify-between"
                    onClick={() => setshowBenefits((prev) => !prev)}
                    aria-expanded={showBenefits}
                    aria-controls="notes-content"
                    type="button"
                >
                    <span>Premium Features</span>
                    <span className="ml-2">{showBenefits ? "▲" : "▼"}</span>
                </button>
                {showBenefits && (
                    <div id="notes-content" className="text-left mb-10 w-full space-y-4">
                        <p>
                            - 1 hour download/cut limit removed.
                        </p>
                        <p>
                            - Access to additional editing tools while cutting to modify speed, frequency, and audio reversal.
                        </p>
                    </div>
                )}
                
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
                    <div id="steps-content" className="text-left mb-10 w-full space-y-4">
                        <p>
                            1. On our{" "}
                            <span
                                className="hover:cursor-pointer text-red-600 font-bold underline"
                                onClick={handleKofiTextClicked}
                            >
                                Ko-fi page
                            </span>
                            , donate once or sign up for a monthly donation.
                        </p>
                        <p>
                            2. Once completed, an email will be automatically sent over containing a personal access key to enable additional features.
                        </p>
                        <p>
                            Premium features last for a month starting from the date of donation. If you are a monthly donor, you will keep benefits for as long as you are subscribed.
                        </p>
                    </div>
                )}

                <div className="flex flex-row items-center justify-center mt-10">
                    <input
                        id="premiumPasswordInput"
                        className="w-32 h-6 px-1 focus:outline-none border border-black text-black placeholder:text-black/40"
                        type="text"
                        placeholder="Access key here"
                    />
                    <button className="ml-4" onClick={passwordEnterPressed}>Enter</button>
                </div>

                <button
                    className="bg-black text-white w-20 h-10 mt-10"
                    onClick={() => {
                        setShowProfileDialog(false);
                    }}
                >
                    Exit
                </button>
            </div> }
        </div>
    );
};

export default ProfileDialog;