import { Link } from 'react-router-dom'
import CircleButton from '../components/ui/Buttons';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../context/AuthContextProvider";

function Home() {

  const navigate = useNavigate()
  const { logout } = useAuthContext();
  const handleLogout = () => {
    logout();
    navigate('/login');
  }; 

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
        Welcome
        <span className="font-text font-light"> User.</span>
      </h1>
      <p className="text-2xl font-text text-black dark:text-white mb-6">
        You have already collected{" "}
        <Link to="/contacts">
          <span className="font-text font-semibold text-red dark:text-red hover:text-red-500 dark:hover:text-red-500"> 250</span>
        </Link>
        {" "}contacts.
      </p>
      <CircleButton 
        size="medium"
        variant="dark"
        className="border border-white/30"
        onClick={handleLogout}>
        log out.
      </CircleButton>

    </div> 
  );
}

export default Home;