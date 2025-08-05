import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './UserNavbar';
import Footer from './Footer';
import { useAuthContext } from "../../context/AuthContextProvider";
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

const Button = ({ children, onClick, className = "", ...props }) => {
  return (
    <button
      onClick={onClick}
      className={` text-black dark:text-white hover:text-red-500 dark:hover:text-red-500 transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate()
  const { accessToken, isLoading } = useAuthContext()

  const renderCount = useRef(0);
  renderCount.current++;
  
  console.log('USER LAYOUT rendered:', {
    isLoading: isLoading,
    hasToken: !!accessToken,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  const authChecked = useRef(false);

  useEffect(() => {
    if (isLoading || authChecked.current) return;
  
    console.log('USER LAYOUT: accessToken gets checked.');
    if (!accessToken) {
      navigate('/login', { replace: true });
    } else {
      authChecked.current = true; // Mark as checked
    }
}, [isLoading, accessToken]);

  
  if (isLoading || accessToken === undefined) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-black dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans flex flex-col">
      <Navbar />
      
      <main className=" pt-16 flex-grow w-full">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default UserLayout;