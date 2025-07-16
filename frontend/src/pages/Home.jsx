import { Link } from 'react-router-dom'
import CircleButton from '../components/ui/Buttons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthContext } from "../context/AuthContextProvider";

function Home() {

  const navigate = useNavigate()
  const { logout } = useAuthContext();
  const handleLogout = () => {
    logout();
    navigate('/login');
  }; 

  return (
    <div className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-heading font-light text-gray-900 dark:text-white mb-7">
            hello <span className="text-red-500 font-medium">user.</span>
        </h1>
        <container className="text-2xl font-text font-light text-black dark:text-white mb-6">
          <p>welcome to your very own personal space.</p>
            <p className="mb-10"> keep track of all your connections that matter to you. </p>
            
            <p className="text-2xl font-text text-black dark:text-white mb-6">
              you already have collected{" "}
              <Link to="/myspace/contacts">
                <span className="font-text font-semibold text-red dark:text-red hover:text-red-500 dark:hover:text-red-500"> 250</span>
              </Link>
              {" "}contacts.
            </p>
      </container>
      <CircleButton 
        size="large"
        variant="dark"
        className="border border-white/30 bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:border-red-500 "
            style={{ 
                        marginTop: '3rem', 
                        marginLeft: 'auto',
                        display: 'block' 
                    }}
        onClick={handleLogout}>
        log out.
      </CircleButton>

    </div> 
  );
}

export default Home;