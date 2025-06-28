import { Link } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { buttonStyles } from '../ui/ButtonStyles.jsx';
import { useRef, useEffect } from 'react';

const MenuBar = ({ isMenuOpen, setIsMenuOpen }) => {
  const menuRef = useRef(null);

  const menuItems = [
    { to: "/", label: "home." },
    { to: "/contacts", label: "allContacts." },
    { to: "/addcontact", label: "newContact." },
    { to: "/goodbye/logout", label: "logout."}
  ];

  const linkClasses = "block top-20 px-4 py-1 pt-6 font-text font-semibold text-lg text-white dark:text-black  hover:text-red-500 dark:hover:text-red-500 rounded transition-colors duration-200";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    // Only add event listener when menu is open
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, setIsMenuOpen]);

  return (
    <div ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`${buttonStyles.base} ${
          isMenuOpen ? buttonStyles.active : buttonStyles.normal
        }`}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="fixed top-16 right-0 h-80 w-40 bg-black dark:text-black dark:bg-white z-50 md:hidden transform transition-transform duration-200 ease-in-out shadow-lg rounded-l-lg border-radius">
          <div className="space-y-2 p-1">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={linkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBar;