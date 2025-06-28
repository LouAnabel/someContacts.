
import { Link } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { buttonStyles } from '../styles/buttonStyles.js';

const MenuBar = ({ isMenuOpen, setIsMenuOpen }) => {
  const menuItems = [
    { to: "/", label: "Home" },
    { to: "/allcontacts", label: "All Contacts" },
    { to: "/addcontact", label: "Add Contact" }
  ];

  const linkClasses = "block px-4 py-2 font-text text-lg text-gray-900 dark:text-black hover:bg-red-200 hover:text-red-500 dark:hover:text-red-500 rounded transition-colors duration-200";

  return (
    <>
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
        <div className="fixed top-16 right-0 h-auto w-64 bg-gray-500 bg-opacity-10 dark:text-black dark:bg-white z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-lg">
          <div className="space-y-1 p-2">
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
    </>
  );
};

export default MenuBar;