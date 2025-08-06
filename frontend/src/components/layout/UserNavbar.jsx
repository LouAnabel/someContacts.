import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../theme/ThemeToggle.jsx';
import SearchForm from '../forms/SearchFormNavbar.jsx'
import MenuBar from './Menubar.jsx'
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

const Navbar = () => {
  // console.log('Navbar rendered');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthContext(); 

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
    // Add your search logic here
    if (searchTerm.trim()) {
      // Navigate to all contacts page (you can handle the filtering there)
      navigate('/myspace/contacts', { state: { searchTerm } });
    }
  };

  // Common navigation items for desktop
  const navItems = [
  { to: "/myspace/contacts", firstPart: "all", secondPart: "Contacts." },
  { to: "/myspace/newcontact", firstPart: "new", secondPart: "Contact." }
  ];

  return (
    <nav className="bg-white font-text dark:bg-black fixed w-full z-50 top-0">
      <div className=" max-w-screen-xl mx-auto px-8 relative">
        
        <div className="flex justify-between items-center h-20">
          {/* someContacts. Title */}
          <Link to="/myspace/" className="flex items-center">
            <span className="text-3xl sm:text-3xl tracking-wide font-heading text-black hover:text-red-500 dark:text-white hover:dark:text-red-500">
              <span className="font-semibold">some</span>
              <span className="font-light">Contacts.</span>
            </span>
          </Link>

          {/* search + Theme + Menu toggle */}
          <div className="flex items-center px-0 md:hidden">
            
            <SearchForm 
              onSearch={handleSearch}
            />
            
            <ThemeToggle />
            <MenuBar 
              isMenuOpen={isMenuOpen} 
              setIsMenuOpen={setIsMenuOpen} 
            />

            <Button 
              onClick={handleLogout}
              className="ml-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" 
                  clipRule="evenodd" 
                />
              </svg>
            </Button>
          </div>

          {/* Bigger screens: Mobile search + Nav links + Theme */}
          <div className="hidden md:flex items-center space-x-6 tracking-wider">
            <SearchForm 
              onSearch={handleSearch}
            />
            <div className="flex items-center text-xl space-x-5">
            {navItems.map((item) => (
              <Link 
                key={item.to}
                to={item.to} 
                className="nav-link hover:text-red-500 dark:hover:text-red-500"
              >
                <span className="font-semibold">{item.firstPart}</span>
                <span className="font-light">{item.secondPart}</span>
              </Link>
            ))}
            </div>
            <ThemeToggle />
            <Button 
              onClick={handleLogout}
              className="ml-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" 
                  clipRule="evenodd" 
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;