import { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../theme/ThemeToggle.jsx';
import Search from '../ui/Search.jsx';
import { HiMenu, HiX } from 'react-icons/hi';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
    // Add your search logic here
  };

  return (
    <nav className="bg-white dark:bg-black  dark:border-gray-800 fixed w-full z-50 top-0">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl sm:text-3xl font-heading text-black hover:text-red-500 dark:text-white hover:dark:text-red-500 ">
              <span className="font-semibold">some</span>
              <span className="font-light">Contacts.</span>
            </span>
          </Link>

          {/* Mobile: Search + Theme + Hamburger */}
          <div className="flex items-center space-x-2 md:hidden">
            <Search 
              isMobile={true}
              placeholder="Search contacts..."
              onSearch={handleSearch}
            />
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${
                isMenuOpen 
                ? 'text-red-500 hover:bg-red-200 dark:bg-black dark:text-red-500' // Active styles (same as hover)
                : 'text-gray-900 dark:text-white hover:text-red-500 hover:bg-red-200 dark:hover:text-red-500' // Normal styles
            }`}
            >
              {isMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6 " />}
            </button>
          </div>

          {/* Desktop: Search + Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Search 
              placeholder="Search contacts..."
              onSearch={handleSearch}
            />
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/allcontacts" className="nav-link">All Contacts</Link>
            <Link to="/addcontact" className="nav-link">Add Contact</Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed top-30 right-0 h-50 w-64 bg-gray-500 bg-opacity-10 dark:text-black dark:bg-white z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="space-y-1">
              <Link to="/" className="block px-4 py-2 font-text text-lg text-gray-900 dark:text-black hover:bg-red-200 hover:text-red-500 dark:hover:text-red-500 rounded" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/allcontacts" className="block px-4 py-2 font-text text-lg text-gray-900 dark:text-black hover:bg-red-200 hover:text-red-500 dark:hover:text-red-500 rounded" onClick={() => setIsMenuOpen(false)}>
                All Contacts
              </Link>
              <Link to="/addcontact" className="block px-4 py-2 font-text text-lg text-gray-900 dark:text-black hover:bg-red-200 hover:text-red-500 dark:hover:text-red-500 rounded" onClick={() => setIsMenuOpen(false)}>
                Add Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;