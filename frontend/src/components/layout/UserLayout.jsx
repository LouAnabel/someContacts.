import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

function UserLayout() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-200 flex flex-col">
      <Navbar />
      <main className="pt-16 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;