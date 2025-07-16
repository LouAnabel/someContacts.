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
        <div className="container mx-auto px-4 py-40">
        <h1 className="text-3xl font-heading font-light text-gray-900 dark:text-white mb-3">
            welcome to <span className="text-red-500 font-medium">someContacts.</span>
        </h1>
        <container className="text-2xl font-text font-light text-black dark:text-white mb-6">
            <p> keep all your contacts in one smart space. </p> 
            <p> personal notes meet professional handling, and everything stays effortlessly organized.</p> 
            <p>Just the way you need it. Whether it’s your best friend, your favorite client, or that one person you always forget – </p>
            <p>this App got you covered.</p>
            <p className="mt-10"> Wanna join? {" "}   
                <Link to="/register">
                <span className="font-text font-normal hover:underline text-red-500 "> create your account</span>
                </Link>
                {" "}now.
            </p>
        </container>
        <CircleButton 
            size="xl"
            variant="dark"
            className="border border-white/30 bg-black hover:bg-red-500 dark:bg-red-500 dark:border-red-500 dark:hover:border-red-600"
            style={{ 
                        marginTop: '2rem', 
                        display: 'block' 
                    }}
            onClick={handleClick}>
            log in.
        </CircleButton>
       </div>
    );
    }

    export default LandingPage;