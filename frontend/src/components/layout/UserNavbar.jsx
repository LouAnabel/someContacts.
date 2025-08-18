import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchForm from '../forms/SearchFormNavbar.jsx'
import MenuBar from './UserMenubar.jsx';
import { useAuthContext } from "../../context/AuthContextProvider";

// Button component for the logout functionality
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

// creating Navbar Object
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthContext(); 

  // Debug logging
  console.log('Navbar rendered with:', { 
    isMenuOpen, 
    setIsMenuOpen: typeof setIsMenuOpen 
  });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const goToAllContacts = () => {
    navigate('/myspace/contacts', { replace: true });
  };

  const goToNewContact = () => {
    navigate('/myspace/newcontact');
  }

  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
    if (searchTerm.trim()) {
      navigate('/myspace/contacts', { state: { searchTerm } });
    }
  };

  // Enhanced setIsMenuOpen with logging
  const setMenuOpenWithLogging = (value) => {
    console.log('📱 Setting menu open to:', value);
    setIsMenuOpen(value);
  };

  // Common navigation items for desktop
  const navItems = [
    { to: "/myspace/contacts", firstPart: "all", secondPart: "Contacts." },
    { to: "/myspace/newcontact", firstPart: "new", secondPart: "Contact." }
  ];

  return (
    <nav className="bg-gray-50 bg-opacity-90 font-text dark:bg-gray-900 fixed w-full z-50 top-0">
      <div className=" max-w-screen-xl mx-auto px-8 pr-9 relative">
        
        <div className="flex justify-between items-center h-20">
          {/* someContacts. Title */}
          <Link to="/myspace/" className="flex items-center">
            <span className="text-3xl tracking-widesm:text-3xl font-heading text-gray-800 hover:text-red-500 dark:text-white hover:dark:text-red-500">
              <span className="font-semibold">some</span>
              <span className="font-light">Contacts.</span>
            </span>
          </Link>

          {/* MOBILE: search + Theme + Menu toggle */}
          <div className="flex items-center md:hidden -mr-6 space-x-1">
            <SearchForm onSearch={handleSearch} />

            {/* Add Contact Button */}
            <Button onClick={goToNewContact} className="">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
              </svg>
            </Button>

            {/* MOBILE MenuBar */}
            <div>
              <MenuBar 
                isMenuOpen={isMenuOpen} 
                setIsMenuOpen={setMenuOpenWithLogging} 
              />
            </div>
          </div>

          {/* DESKTOP: search + Nav links + Theme + Menu */}
          <div className="hidden md:flex items-center space-x-3 tracking-wider">
            <SearchForm onSearch={handleSearch} />

            <div className="flex items-center text-xl space-x-5">
              {navItems.map((item) => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className="nav-link hover:text-red-500 dark:hover:text-red-500"
                >
                  <span className="font-normal">{item.firstPart}</span>
                  <span className="font-extralight">{item.secondPart}</span>
                </Link>
              ))}
            </div>

            {/* DESKTOP MenuBar */}
            <div>
              <MenuBar 
                isMenuOpen={isMenuOpen} 
                setIsMenuOpen={setMenuOpenWithLogging} 
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;