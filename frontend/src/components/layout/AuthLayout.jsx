import AuthHeader from "./AuthHeader";
import { Outlet} from "react-router";
import Footer from "./Footer";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-heading flex flex-col">
      <AuthHeader />
      <main className="flex-grow items-center justify-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AuthLayout;