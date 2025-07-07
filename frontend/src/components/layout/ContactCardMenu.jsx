import { Link } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { buttonStyles } from '../ui/ButtonStyles.jsx';
import { useRef, useEffect } from 'react';

const ContactMenuBar = ({isMenuOpen, setIsMenuOpen}) => {
    
    // const navigate = useNavigate();
    const menuRef = useRef(null);

    const menuItems = [
        { to: "/contact", firstPart: "open", secondPart: "Contact." },
        { to: "/editcontact", firstPart: "edit", secondPart: "Contact." }
    ];

    const linkClasses = "block top-20 px-4 py-1 pt-6 font-sans font-semibold text-lg dark:text-black hover:text-red-500 dark:hover:text-red-500 rounded-2xl ";

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
            className={`text-black hover:text-red-500 ${
            isMenuOpen ? 'text-red-500 font-md' : ''
            }`}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
            {isMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
        </button>

        {isMenuOpen && (
            <div className="fixed top-20 right-0 h-40 w-40 dark:text-black z-50 transform ease-in-out shadow-lg rounded-2xl border-radius">
            <div className="space-y-2 p-2 tracking-wider">
                {menuItems.map((item) => (
                <Link
                    key={item.to}
                    to={item.to}
                    className={linkClasses}
                    onClick={() => setIsMenuOpen(false)}
                >
                    <span className="font-semibold">{item.firstPart}</span>
                    <span className="font-light">{item.secondPart}</span>
                </Link>
                ))}
            </div>
            </div>
      )}
    </div>
  );
};

export default ContactMenuBar;