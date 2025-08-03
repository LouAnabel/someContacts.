import { Link } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { buttonStyles } from '../ui/Buttons'; 
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../../context/AuthContextProvider";

const MenuBar = ({ isMenuOpen, setIsMenuOpen }) => {
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuthContext(); 

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { to: "/myspace", secondPart: "home." },
    { to: "/myspace/contacts", firstPart: "all", secondPart: "Contacts." },
    { to: "/myspace/newcontact", firstPart: "new", secondPart: "Contact." },
    { action: "logout", firstPart: "log", secondPart: "out." }
  ];

  const linkClasses = "block px-4 py-3 font-sans font-semibold text-lg text-white dark:text-black hover:text-red-500 dark:hover:text-red-500 rounded transition-colors duration-200";

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
        <div className="fixed top-20 right-0 h-60 w-40 bg-black dark:bg-white z-50 md:hidden transform ease-in-out shadow-lg rounded-l-lg">
          <div className="space-y-1 p-2 tracking-wider">
            {menuItems.map((item) => (
              item.action ? (
                <button 
                  key={item.action}
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className={linkClasses}
                >
                  <span className="font-semibold">{item.firstPart || ''}</span>
                  <span className="font-light">{item.secondPart}</span>
                </button>
              ) : (  
                <Link
                  key={item.to}
                  to={item.to}
                  className={linkClasses}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="font-semibold">{item.firstPart || ''}</span>
                  <span className="font-light">{item.secondPart}</span>
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBar;