import { Link } from 'react-router-dom';

const AuthHeader = () => {
  return (
    <nav className="bg-white dark:bg-black fixed w-full z-50 top-0">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* someContacts. Title */}
          <div className="flex items-center">
            <span className="text-2xl sm:text-3xl font-heading text-black hover:text-red-500 dark:text-white hover:dark:text-red-500 transition-colors duration-200">
              <span className="font-semibold">some</span>
              <span className="font-light">Contacts.</span>
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AuthHeader;