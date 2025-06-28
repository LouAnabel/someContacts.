import { Outlet, Link } from 'react-router-dom';
import AuthHeader from './AuthHeader';
import Footer from './Footer';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-200 flex flex-col">
        <AuthHeader />
        <main className="pt-16 flex-grow">
            <Outlet />
        </main>
            <Footer />
      </div>
    </div>
  );
};

export default AuthLayout;