import { HiMenu, HiX } from 'react-icons/hi';
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../../context/AuthContextProvider";
import ThemeToggle from '../theme/ThemeToggle';

const MenuBar = ({ isMenuOpen, setIsMenuOpen }) => {
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const handleLogout = (e) => {
    e.stopPropagation();

    setIsMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleLinkClick = (to, e) => {
    e.stopPropagation();

    setIsMenuOpen(false);
    navigate(to);
  };

  // Mobile menu items (all items)
  const mobileMenuItems = [
    { to: "/myspace", secondPart: "home." },
    { to: "/myspace/contacts", firstPart: "all", secondPart: "Contacts." },
    { to: "/myspace/categories", firstPart: "all", secondPart: "Categories." },
    { to: "/myspace/profile", firstPart: "my", secondPart: "Profile." },
    { action: "logout", firstPart: "log", secondPart: "out." }
  ];

  // Desktop menu items (excluding allContacts and newContact)
  const desktopMenuItems = [
    { to: "/myspace", secondPart: "home." },
    { to: "/myspace/categories", firstPart: "all", secondPart: "Categories." },
    { to: "/myspace/profile", firstPart: "my", secondPart: "Profile." },
    { action: "logout", firstPart: "log", secondPart: "out." }
  ];

  // Choose menu items based on screen size
  const menuItems = isMobile ? mobileMenuItems : desktopMenuItems;

  const linkClasses = "w-full text-left block px-4 py-3 font-sans text-lg text-black hover:text-red-500 hover:bg-gray-50 rounded cursor-pointer";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {

        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 200);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isMenuOpen, setIsMenuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          isMenuOpen 
            ? 'text-red-500' 
            : 'text-black dark:text-white hover:text-red-500 dark:hover:text-red-500'
        }`}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
      </button>

      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div 
          className={`absolute top-full right-0 mt-2 bg-white border border-gray-200 dark:border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden ${
            isMobile ? 'w-[180px]' : 'w-[160px]'
          }`}
          onClick={(e) => {
            e.stopPropagation();

          }}
        >
          <div className="py-2">
            {menuItems.map((item) => (
              item.action ? (
                <button 
                  key={item.action}
                  onClick={handleLogout}
                  className={`${linkClasses} dark:hover:text-red-500 dark:hover:bg-gray-100`}
                  type="button"
                >
                  <span className="font-normal">{item.firstPart || ''}</span>
                  <span className="font-extralight">{item.secondPart}</span>
                </button>
              ) : (  
                <button
                  key={item.to}
                  onClick={(e) => handleLinkClick(item.to, e)}
                  className={`${linkClasses} dark:hover:text-red-500 dark:hover:bg-gray-100`}
                  type="button"
                >
                  <span className="font-normal">{item.firstPart || ''}</span>
                  <span className="font-extralight">{item.secondPart}</span>
                </button>
              )
            ))}
            
            {/* Theme Toggle */}
            <div className="px-4 py-2">
              <ThemeToggle />
            </div>    
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBar;