import CircleButton from "../components/ui/Buttons";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContextProvider";

function LandingPage() {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/login');
    };

    return (
        <div className="container mx-auto px-4 py-36">
        <h1 className="text-2xl font-heading font-light text-gray-900 dark:text-white mb-10">
            welcome to <span className="text-red-500 tracking-wide">someContacts.</span>
        </h1>
        <container className="text-xl font-text font-light text-black dark:text-white mb-6">
            <p className="mb-3"> keep all your contacts in one smart space. </p> 
            <p>collect personal notes, pictures, and every important detail while everything stays effortlessly organized.</p> 
            <p>Just the way you need it. Whether it’s your best friend, your favorite client, or that one person's name you always forget – </p>
            <p>this App got you covered.</p>
            <p className="mt-10"> Wanna join? {" "}   
                <Link to="/register">
                <span className="font-text font-light hover:underline text-red-500 "> create your account</span>
                </Link>
                {" "}now.
            </p>
        </container>
        <CircleButton 
            size="xl"
            variant="dark"
            className="border border-white/30 bg-red-500 hover:bg-red-600 dark:border-red-500"
            style={{ 
                        marginTop: '3rem', 
                        display: 'block' 
                    }}
            onClick={handleClick}>
            log in.
        </CircleButton>
       </div>
    );
    }

    export default LandingPage;