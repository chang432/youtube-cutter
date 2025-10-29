const InfoDialog = ({ setShowInfoDialog }) => {

    return (
        <div>
            <div className="fixed inset-0 z-[9998] bg-gray-300 opacity-50">
            </div>
            <div className="fixed inset-1/2 xs:w-1/2 w-3/4 h-fit transfrom -translate-x-1/2 -translate-y-1/2 z-[9999] border border-black bg-white flex flex-col justify-center items-center xs:py-10 py-2 xs:px-20 px-4 text-center leading-tight xs:text-lg text-xs">
                <div className="mb-8 flex flex-col">
                    <p className="font-bold">We have decided to make premium features free, all users now have:</p>
                    <p>- Access to additional editing tools while cutting to modify speed, frequency, and audio reversal.</p>
                    <p>- 2 hour download limit (note: downloads over an hour will take a while)</p>
                </div>
                <button className="bg-black text-white w-20 h-10" onClick={() => {setShowInfoDialog(false)}}>Exit</button>
            </div>
        </div>
    );
};

export default InfoDialog;