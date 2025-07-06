import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../theme/ThemeToggle.jsx';
import SearchToggle from '../forms/SearchToggle.jsx'
import MenuBar from './Menubar.jsx'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
    // Add your search logic here
    if (searchTerm.trim()) {
      // Navigate to all contacts page (you can handle the filtering there)
      navigate('/contacts', { state: { searchTerm } });
    }
  };

  // Common navigation items for desktop
  const navItems = [
    // { to: "/", label: "home." },
    { to: "/contacts", label: "allContacts" },
    { to: "/addcontact", label: "newContact" }
  ];

  return (
    <nav className="bg-white dark:bg-black dark:border-gray-800 fixed w-full z-50 top-0">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          
          {/* someContacts. Title */}
          <Link to="/" className="flex items-center">
            <span className="p-3 text-3xl sm:text-3xl font-heading text-black hover:text-red-500 dark:text-white hover:dark:text-red-500">
              <span className="font-semibold">some</span>
              <span className="font-light">Contacts.</span>
            </span>
          </Link>

          {/* Small screens: Mobile search + Theme + Menu toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            
            <SearchToggle 
              isMobile={true}
              placeholder="search contacts..."
              onSearch={handleSearch}
            />
            
            <ThemeToggle />
            <MenuBar 
              isMenuOpen={isMenuOpen} 
              setIsMenuOpen={setIsMenuOpen} 
            />
          </div>

          {/* Medium screens: Mobile search + Nav links + Theme */}
          <div className="hidden md:flex items-center space-x-6">
            <SearchToggle 
              isMobile={true}
              placeholder="search contacts..."
              onSearch={handleSearch}
            />
            <div className="flex items-center text-lg space-x-5">
            {navItems.map((item) => (
              <Link 
                key={item.to}
                to={item.to} 
                className="nav-link hover:text-red-500 dark:hover:text-red-500"
              >
                {item.label}
              </Link>
            ))}
            </div>
            <ThemeToggle />
          </div>

           
          </div>
        </div>
    </nav>
  );
};

export default Navbar;