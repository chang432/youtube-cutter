import React, { useState } from 'react';
import { useAlert } from "./AlertProvider";
import axios from "axios";
import JwtStorageHelper from "./JwtStorageHelper";

const ProfileDialog = ({ setShowProfileDialog, premiumEnabled, setpremiumEnabled, setShowLoader }) => {
    const [showSteps, setShowSteps] = useState(false);
    const [showBenefits, setshowBenefits] = useState(false);
    const [showProfileDialogContents, setShowProfileDialogContents] = useState(true);
    const { showAlert } = useAlert();

    const jwtStorageHelper = new JwtStorageHelper();

    function handleKofiTextClicked() {
        window.open("https://ko-fi.com/wavninja", "_blank");
    }

    async function passwordEnterPressed() {
        let password = document.getElementById("premiumPasswordInput").value;

        if (password.length != 14) {
            showAlert("Invalid Password!");
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
                showAlert("Invalid Password!");
            } else {
                setpremiumEnabled(authorized);
                jwtStorageHelper.setToken(output.access_token);
            }
        })
    }

    return (
        <div>
            <div className="fixed inset-0 z-[9998] bg-black opacity-50"></div>
            <div className="fixed inset-1/2 xs:w-1/2 w-3/4 h-fit transfrom -translate-x-1/2 -translate-y-1/2 z-[9999] border border-black bg-white flex flex-col justify-center items-center xs:py-10 xs:px-20 py-4 px-8 text-center leading-tight xs:text-lg text-xs">

                { premiumEnabled && <div className="flex flex-col items-center text-center w-full">
                    <div className="xs:mb-8 mb-4 flex flex-row">
                        <p>
                            Thank you for donating!
                        </p>
                        
                    </div>
                    {/* Benefits Tab */}
                    <h1
                        className="w-full text-left text-red-600 font-semibold mb-2 focus:outline-none border-b border-gray-300 py-2 flex items-center justify-between"
                    >
                        <span>Active Premium Features</span>
                    </h1>
                    <div id="notes-content" className="text-left w-full space-y-4">
                        <p>
                            - 1 hour download/cut limit changed to 3 hours.
                        </p>
                        <p>
                            - Access to additional editing tools while cutting to modify speed, frequency, and audio reversal.
                        </p>
                    </div>
                
                    <button
                        className="bg-black text-white lg:w-20 lg:h-10 lg:mt-10 w-10 h-6 mt-4"
                        onClick={() => {
                            setShowProfileDialog(false);
                        }}
                    >
                        Exit
                    </button>
                </div> }

                { !premiumEnabled && <div>
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
                                - 1 hour download/cut limit changed to 3 hours.
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
                            <p>
                                Contact us at wavninja@gmail.com if there are any issues!
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
                        className="bg-black text-white lg:w-20 lg:h-10 lg:mt-10 w-10 h-6 mt-4"
                        onClick={() => {
                            setShowProfileDialog(false);
                        }}
                    >
                        Exit
                    </button>
                </div> }
            </div> 
        </div>
    );
};

export default ProfileDialog;