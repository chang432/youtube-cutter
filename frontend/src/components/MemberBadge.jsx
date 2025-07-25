import apprenticeImg from '../assets/user-apprentice.png';
import ninjaImg from '../assets/user-ninja.png';

const MemberBadge = ({ isPremium, setShowProfileDialog }) => {
    return (
        <div className="fixed top-3 right-4">
            <div
                className="bg-stone-100 rounded-full pl-2 pr-6 py-2 flex flex-row items-center justify-between space-x-4 border border-black cursor-pointer transition-colors duration-200 hover:bg-stone-400"
                onClick={() => {setShowProfileDialog(true)}}
            >
                <img
                    src={isPremium ? ninjaImg : apprenticeImg}
                    className="h-8 w-8 object-cover rounded-full border border-black p-1"
                />
                <p className="ml-auto font-semibold">{isPremium ? "Premium" : "Free"}</p>
            </div>
        </div>
    );
};

export default MemberBadge;