import { HiMenu, HiX } from 'react-icons/hi';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../../context/AuthContextProvider";
import ThemeToggle from '../theme/ThemeToggle';

const MenuBar = ({ isMenuOpen, setIsMenuOpen }) => {
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuthContext(); 

  const handleLogout = (e) => {
    e.stopPropagation();
    console.log('Logout clicked');
    setIsMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleLinkClick = (to, e) => {
    e.stopPropagation();
    console.log('🔵 Navigation clicked to:', to);
    setIsMenuOpen(false);
    navigate(to);
  };

  const menuItems = [
    { to: "/myspace", secondPart: "home." },
    { to: "/myspace/contacts", firstPart: "all", secondPart: "Contacts." },
    { to: "/myspace/newcontact", firstPart: "new", secondPart: "Contact." },
    { action: "logout", firstPart: "log", secondPart: "out." }
  ];

  const linkClasses = "w-full text-left block px-4 py-3 font-sans text-xl text-black hover:text-red-500 hover:bg-gray-50 rounded transition-all duration-200 cursor-pointer";

  // PROPERLY FIXED: Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the menu exists and if the click was outside
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        console.log('Actually clicked outside menu, closing');
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      // Add a longer delay to ensure menu is fully rendered
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

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-[160px] bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden"
          onClick={(e) => {
            // Prevent clicks inside the dropdown from bubbling up
            e.stopPropagation();
            console.log('Clicked inside dropdown');
          }}
        >
          <div className="py-2">
            {menuItems.map((item) => (
              item.action ? (
                <button 
                  key={item.action}
                  onClick={handleLogout}
                  className={linkClasses}
                  type="button"
                >
                  <span className="font-normal">{item.firstPart || ''}</span>
                  <span className="font-extralight">{item.secondPart}</span>
                </button>
              ) : (  
                <button
                  key={item.to}
                  onClick={(e) => handleLinkClick(item.to, e)}
                  className={linkClasses}
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