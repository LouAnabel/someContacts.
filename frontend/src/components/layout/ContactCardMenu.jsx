import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { useRef, useEffect, useState } from 'react';
import { deleteContactById } from '../../apiCalls/contactsApi';
import { useAuthContext } from '../../context/AuthContextProvider';


const ContactMenuBar = ({isMenuOpen, setIsMenuOpen, id, contactName}) => {
    
    const navigate = useNavigate();
    const { accessToken } = useAuthContext();
    const menuRef = useRef(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [errors, setErrors] = useState({});

    const menuItems = [
        { to: `${id}`, firstPart: "open", secondPart: "Contact.", type: "link" },
        { to: "delete", firstPart: "delete", secondPart: "Contact.", type: "button", action: () => setShowDeleteConfirmation(true) }
    ];

    // DELETING contact
    const handleDeleteContact = async () => {
        setIsDeleting(true);

        try {
            if(!accessToken) {
                throw new Error("AccessToken is not valid")
            }

            // API call
            console.log("Deleting contact with ID:", {id})
            const deleteMessage = await deleteContactById(accessToken, id);
            console.log('Contact deleted successfully:', deleteMessage);

            setIsMenuOpen(false);
            setShowDeleteConfirmation(false);
    
            // Navigate back to contacts list after successful deletion
            navigate('/myspace/contacts', { replace: true });
    
        } catch (error) {
            console.error('Error deleting contact:', error);
            // Show user-friendly error message
            setErrors(prev => ({ ...prev, submit: `Failed to delete contact: ${error.message}` }));
            
            } finally {
            setIsDeleting(false);
            setShowDeleteConfirmation(false);
            }
        };
        
    const linkClasses = "block px-1 pb-2 pt-1 font-sans font-semibold text-lg dark:text-black hover:text-red-500 dark:hover:text-red-500 rounded-2xl ";

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
            {isMenuOpen ? <HiX className="h-7 w-7" /> : <HiMenu className="h-7 w-7" />}
        </button>

        {isMenuOpen && (
                <div className="fixed top-24 right-0 h-35 w-40 dark:text-black z-50 bg-white transform ease-in-out shadow-lg rounded-2xl border-radius">
                    <div className="space-y-2 p-3 tracking-wider">
                        {menuItems.map((item) => {
                            if (item.type === "link") {
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.to}
                                        className={linkClasses}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span className="font-semibold">{item.firstPart}</span>
                                        <span className="font-light">{item.secondPart}</span>
                                    </Link>
                                );
                            } else {
                                return (
                                    <button
                                        key={item.id}
                                        className={linkClasses}
                                        onClick={item.action}
                                        disabled={isDeleting}
                                    >
                                        <span className="font-semibold">{item.firstPart}</span>
                                        <span className="font-light">{item.secondPart}</span>
                                    </button>
                                );
                            }
                        })}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                     style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
                    <div className="bg-white rounded-3xl p-8 relative overflow-visible w-[85vw] min-w-[280px] max-w-[400px] mx-auto"
                         style={{ 
                           boxShadow: '0 8px 48px rgba(109, 71, 71, 0.35)'
                         }}>
                      
                        {/* Warning Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <svg 
                                    className="w-8 h-8 text-red-500" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-center mb-4 text-black">
                            delete <span className="text-red-500">{contactName || 'contact'}?</span>
                        </h2>
                        
                        {/* Message */}
                        <p className="text-center text-gray-600 font-light mb-8 leading-relaxed">
                            this action cannot be undone. all contact information, notes, and history will be permanently removed.
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                            {/* Cancel Button */}
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirmation(false)}
                                disabled={isDeleting}
                                className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-light hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontSize: '16px' }}
                            >
                                cancel
                            </button>
                            
                            {/* Delete Button */}
                            <button
                                type="button"
                                onClick={handleDeleteContact}
                                disabled={isDeleting}
                                className="flex-1 py-3 px-6 rounded-xl bg-red-500 text-white font-light hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                style={{ fontSize: '16px' }}
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        deleting...
                                    </>
                                ) : (
                                    'delete forever'
                                )}
                            </button>
                        </div>

                        {/* Show error if deletion fails */}
                        {errors.submit && (
                            <p className="text-center text-red-600 text-sm mt-4 font-light">
                                {errors.submit}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactMenuBar;