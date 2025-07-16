import AuthNavbar from "./AuthNavbar";
import { Outlet} from "react-router";
import Footer from "./Footer";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

function AuthLayout() {
  const location = useLocation();



  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-heading flex flex-col">
      <AuthNavbar />
      <main className="flex-grow items-center justify-center">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default AuthLayout;