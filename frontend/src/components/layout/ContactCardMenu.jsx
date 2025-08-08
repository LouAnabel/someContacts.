import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { useRef, useEffect, useState } from 'react';
import { useAuthContext } from '../../context/AuthContextProvider';


const ContactMenuBar = ({onDeleteRequest, isMenuOpen, setIsMenuOpen, id }) => {
    
    const navigate = useNavigate();
    const { accessToken } = useAuthContext();
    const menuRef = useRef(null);

    const menuItems = [
        {
            id: "open",
            type: "link",
            to: `/myspace/contacts/${id}`,
            firstPart: "open",
            secondPart: "contact"
        },
        {
            id: "delete",
            type: "button",
            firstPart: "delete",
            secondPart: "contact",
            action: onDeleteRequest
        }
    ];
        
    const linkClasses = "block px-1 pb-2 pt-1 font-sans font-semibold text-lg dark:text-black hover:text-red-500 dark:hover:text-red-500 rounded-2xl ";

    
    useEffect(() => {
        const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
        };

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
            {isMenuOpen ? <HiX className="h-7 w-7" /> : <HiMenu className="h-7 w-7" />}
        </button>

        {isMenuOpen && (
                <div className="fixed top-16 p-2 pl-3 border border-gray-100 right-0 h-30 w-40 dark:text-black z-40 bg-white transform ease-in-out shadow-lg rounded-2xl border-radius">
                    <div className="space-y-2 tracking-wider">
                        {menuItems.map((item) => {
                            if (item.type === "link") {
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.to}
                                        className={linkClasses}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span className="font-base">{item.firstPart}</span>
                                        <span className="font-extralight">{item.secondPart}</span>
                                    </Link>
                                );
                            } else {
                                return (
                                    <button
                                        key={item.id}
                                        className={linkClasses}
                                        onClick={() => {
                                            item.action(); 
                                            setIsMenuOpen(false); 
                                        }}
                                    >
                                        <span className="font-semibold">{item.firstPart}</span>
                                        <span className="font-extralight">{item.secondPart}</span>
                                    </button>
                                );
                            }
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactMenuBar;