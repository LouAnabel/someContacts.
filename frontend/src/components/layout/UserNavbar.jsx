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

  const goToAllContacts = () => {
    navigate('/myspace/contacts', { replace: true });
  };

  const goToNewContact = () => {
    navigate('/myspace/newcontact');
  }

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
    <nav className="bg-gray-50 bg-opacity-90 font-text dark:bg-black fixed w-full z-50 top-0">
      <div className=" max-w-screen-xl mx-auto px-8 pr-9 relative">
        
        <div className="flex justify-between items-center h-20">
          {/* someContacts. Title */}
          <Link to="/myspace/" className="flex items-center">
            <span className="text-3xl tracking-widesm:text-3xl font-heading text-gray-800 hover:text-red-500 dark:text-white hover:dark:text-red-500">
              <span className="font-semibold">some</span>
              <span className="font-light">Contacts.</span>
            </span>
          </Link>

          {/* search + Theme + Menu toggle */}
          <div className="flex items-center md:hidden -mr-6 space-x-1">
            
            {/* <SearchForm 
              onSearch={handleSearch}
            /> */}


            {/* Go to AllContacts/Search */}
            <Button 
              onClick={goToAllContacts}
              className="mr-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
              </svg>
            </Button>
            

            {/* Add Contact Button */}
            <Button 
              onClick={goToNewContact}
              className=""
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
              </svg>
            </Button>
            
  

            <MenuBar 
              isMenuOpen={isMenuOpen} 
              setIsMenuOpen={setIsMenuOpen} 
            />

            {/* Handle Logout
            <Button 
              onClick={handleLogout}
              className="ml-1"
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
            </Button> */}
          </div>

          {/* Bigger screens: Mobile search + Nav links + Theme */}
          <div className="hidden md:flex items-center space-x-3 tracking-wider">
            
            {/* Search at AllContacts */}
            {/* <Button 
              onClick={goToAllContacts}
              className="mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
              </svg>
            </Button> */}

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
            <ThemeToggle />
            <Button 
              onClick={handleLogout}
              className="ml-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6 text-extralight"
              >
                <path 
                  fillRule="none" 
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