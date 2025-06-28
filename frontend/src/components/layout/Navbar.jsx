import { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../theme/ThemeToggle.jsx';
import Search from '../ui/Search.jsx';
import MenuBar from '../ui/MenuBar.jsx';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
    // Add your search logic here
    if (searchTerm.trim()) {
    // Navigate to all contacts page (you can handle the filtering there)
    navigate('/allcontacts', { state: { searchTerm } });
    }
  };
};

  // Common navigation items for desktop
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/allcontacts", label: "All Contacts" },
    { to: "/addcontact", label: "Add Contact" }
  ];

  return (
    <nav className="bg-white dark:bg-black dark:border-gray-800 fixed w-full z-50 top-0">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* someContacts. Title */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl sm:text-3xl font-heading text-black hover:text-red-500 dark:text-white hover:dark:text-red-500 transition-colors duration-200">
              <span className="font-semibold">some</span>
              <span className="font-light">Contacts.</span>
            </span>
          </Link>

          {/* Mobile: Search + Theme + Menubar */}
          <div className="flex items-center space-x-2 md:hidden">
            <Search 
              isMobile={true}
              placeholder="Search contacts..."
              onSearch={handleSearch}
            />
            <ThemeToggle />
            <MenuBar 
              isMenuOpen={isMenuOpen} 
              setIsMenuOpen={setIsMenuOpen} 
            />
          </div>

          {/* Desktop: Search + Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Search 
              placeholder="Search contacts..."
              onSearch={handleSearch}
            />
            {navItems.map((item) => (
              <Link 
                key={item.to}
                to={item.to} 
                className="nav-link"
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;