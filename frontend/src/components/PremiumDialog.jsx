import React from 'react';

const PremiumDialog = ({ setShowPremiumDialog }) => {

    function handleKofiTextClicked() {
        window.open("https://ko-fi.com/wavninja", "_blank");
    }

    return (
        <div>
            <div className="fixed inset-0 z-[9998] bg-gray-300 opacity-50">
            </div>
            <div className="fixed inset-1/2 w-1/2 h-fit transfrom -translate-x-1/2 -translate-y-1/2 z-[9999] border border-black bg-white flex flex-col justify-center items-center py-10 px-20 text-center leading-tight text-lg">
                <div className="mb-8 flex flex-row">
                    <p>
                        <span className="text-red-600">Help us pay for server costs</span>
                        {" with a monthly donation of $3!"}
                    </p>
                </div>
                <p className="mb-10">Get access to additional editing tools to modify speed, frequency, and reverse audio</p>
                <p className="text-red-600">Follow the below steps</p>
                <div className="text-left mb-10">
                    <p>1. On our <span className="hover:cursor-pointer text-red-600 font-bold underline" onClick={handleKofiTextClicked}>Ko-fi page</span>, sign up for a monthly donation with your email account</p>
                    <p>2. Once the sign up has been completed, an email will be automatically sent over containing a personal access key to enable additional features.</p>
                </div>
                <p className="text-red-600">Notes</p>
                <div className="text-left mb-10">
                    <p>- The access key only needs to be input once per month as the authentication information will be stored securely as a cookie in your browser for easy access.</p>
                    <p>- Unsubscribe at any time, your access will be valid until the end of the month.</p>
                </div>
                <button className="bg-black text-white w-20 h-10" onClick={() => {setShowPremiumDialog(false)}}>Exit</button>
            </div>
        </div>
    );
};

export default PremiumDialog;