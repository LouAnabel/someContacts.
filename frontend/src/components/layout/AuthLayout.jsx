import AuthHeader from "./AuthHeader";
import { Outlet} from "react-router";
import Footer from "./Footer";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-200 flex flex-col">
        <AuthHeader />
        <div style={{background: 'red', color: 'white', padding: '20px'}}>
          <h1>AUTH LAYOUT IS WORKING!</h1>
        </div>
        <main className="pt-16 flex-grow">
            <div style={{background: 'blue', color: 'white', padding: '20px'}}>
              <h2>MAIN SECTION</h2>
              <Outlet />
            </div>
        </main>
        <Footer />
      </div>
  );
}

export default AuthLayout;