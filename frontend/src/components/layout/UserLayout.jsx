import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './UserNavbar';
import Footer from './Footer';
import { useAuthContext } from "../../context/AuthContextProvider";
import { useNavigate } from 'react-router-dom';



function UserLayout() {
  console.log('UserLayout rendered');
  const location = useLocation();
  const navigate = useNavigate()
  const { accessToken, isLoading } = useAuthContext()

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  

  useEffect(() => {
    console.log('accessToken gets checked.');
    if (!isLoading) {
      console.log('succesffull! access token:', accessToken);
    
      if (!accessToken) {
        console.log('no accessToken, redirecting to login');
        navigate('/login', { replace: true });
      } else {
        console.log('Staying on protected route')
      }
    } 
  }, [isLoading, accessToken, navigate]);
  
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
      
      <main className="pt-16 flex-grow w-full">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default UserLayout;