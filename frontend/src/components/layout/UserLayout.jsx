import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './UserNavbar';
import Footer from './Footer';
import { useAuthContext } from "../../context/AuthContextProvider";
import { useNavigate } from 'react-router-dom';



function UserLayout() {

  const location = useLocation();
  const navigate = useNavigate()
  const { accessToken } = useAuthContext()

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  

  useEffect(() => {
    console.log('Access token:', accessToken);
    if (!accessToken) {
      console.log('no accessToken, redirecting to login');
      navigate('/hello/login', { replace: true });
    }
  }, [accessToken, navigate]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans flex flex-col">
      <Navbar />
      <main className="pt-16 flex-grow">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default UserLayout;