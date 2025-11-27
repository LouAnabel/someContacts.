import { useState } from 'react';
import ContactMenuBar from "./ContactCardMenu";
import ContactCardPhotoSmall from './ContactCardPhoto';
import { useNavigate, Link } from 'react-router';
import { useAuthContext } from '../../context/AuthContextProvider';
import { updateContact } from '../../apiCalls/contactsApi';

const ContactCard = ({contact = {}, onContactUpdate, onDeleteRequest, handleCategoryClick}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const { accessToken } = useAuthContext();
    
    // Local state to track favorite status
    const [localContact, setLocalContact] = useState(contact);

    const handleFavoriteToggle = async () => {
        if (isUpdating) return; // Prevent multiple simultaneous updates
        
        try {
            setIsUpdating(true);
            setError(null);
            
            const newFavoriteState = !localContact.is_favorite;
            
            if (!accessToken) {
                throw new Error("Access token is not available.");
            }




            // Update local state immediately for better UX
            setLocalContact(prev => ({ ...prev, is_favorite: newFavoriteState }));

            // Send ONLY the favorite status - don't use FormDataToApiData helper
            const updatedContactData = {
                is_favorite: newFavoriteState
            };
            


            const apiResponse = await updateContact(accessToken, contact.id, updatedContactData);
            

            
            if (!apiResponse) {
                throw new Error('Failed to update favorite status - no response from server');
            }

            // Notify parent component if callback provided
            if (onContactUpdate) {
                onContactUpdate({...contact, is_favorite: newFavoriteState});
            }
            
        } catch (error) {
            console.error('Error updating favorite status:', error);
            
            // Revert local state on error
            setLocalContact(prev => ({ ...prev, is_favorite: !newFavoriteState }));
            setError(`Failed to update favorite status: ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 relative justify-items"
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            <div className="relative bg-white min-w-[200px] max-w-[480px] rounded-3xl p-3 z-10 overflow-visible h-fit left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)'
                 }}
                >
                 
                {/* Main Content Container with Photo */}
                <div className="flex w-full h-full">
                    {/* Left Third - Photo */}
                    <div className="w-1/3 p-2">
                        <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                            {contact.photo_url ? (
                                <img 
                                    src={contact.photo_url} 
                                    alt={`${contact.first_name} ${contact.last_name}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-red-50 flex items-center justify-center rounded-2xl">
                                    <svg 
                                        className="w-12 h-12 text-red-700"
                                        fill="currentColor" 
                                        viewBox="0 0 20 20"
                                    >
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Two Thirds - Content */}
                    <div className="w-2/3 flex flex-col">
                        {/* Header with Name and Menu */}
                        <div className="flex items-center justify-between w-full mb-2">
                            <div className="flex-1">
                                <h5 className="text-xl md:text-2xl font-semibold text-black leading-tight">
                                    <Link 
                                        to={`/myspace/contacts/${contact.id}`}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        {contact.first_name} {contact.last_name}
                                    </Link>
                                </h5>
                            </div>
                            <div className="flex-shrink-0">
                                <ContactMenuBar 
                                    isMenuOpen={isMenuOpen}
                                    setIsMenuOpen={setIsMenuOpen}
                                    id={contact.id}
                                    onDeleteRequest={onDeleteRequest} 
                                />
                            </div>
                        </div>

                        {/* Categories Display */}
                        {contact && contact.categories && contact.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {contact.categories.slice(0, 2).map((category, index) => (
                                    <span 
                                        key={category.id || index}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleCategoryClick(category.id);
                                        }}
                                        className="inline-block px-3 py-1 border border-red-50 bg-red-50 text-red-700 hover:bg-red-200 rounded-full text-sm font-extralight cursor-pointer"
                                    >
                                        {category.name}
                                    </span>
                                ))}
                                {contact.categories.length > 2 && (
                                    <span className="inline-block px-3 py-1 text-gray-500 text-sm font-extralight">
                                        +{contact.categories.length - 2} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Location and Favorite */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-black text-[17px] font-extralight">
                                {contact.city && contact.country 
                                    ? `${contact.city}, ${contact.country}` 
                                    : contact.city || contact.country || ""
                                } 
                            </span>
                            
                            {/* Favorite Star */}
                            <button
                                type="button"
                                onClick={handleFavoriteToggle}
                                disabled={isUpdating}
                                className={`flex items-center hover:scale-110 transform ${
                                    isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                aria-label={localContact.is_favorite ? "Unmark as favorite" : "Mark as favorite"}
                            >
                                <svg 
                                    className={`w-5 h-5 transition-colors ${
                                        localContact.is_favorite 
                                            ? 'text-red-500 hover:text-yellow-300' 
                                            : 'text-black hover:text-yellow-300'
                                    }`} 
                                    aria-hidden="true" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="currentColor" 
                                    viewBox="0 0 22 20"
                                >
                                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                </svg>
                            </button>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-1">
                            {/* Phone Number */}
                            {contact.phone && (
                                <div className="flex items-center text-red-300">
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        strokeWidth="1" 
                                        stroke="currentColor" 
                                        className="w-4 h-4 flex-shrink-0"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" 
                                        />
                                    </svg>
                                    <a 
                                        href={`tel:${contact.phone}`}
                                        className="ml-2 text-black text-lg font-extralight hover:text-red-500 transition-colors truncate"
                                    >
                                        {contact.phone}
                                    </a>
                                </div>
                            )}

                            {/* Email Address */}
                            {contact.email && (
                                <div className="flex items-center text-red-300">
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        strokeWidth="1" 
                                        stroke="currentColor" 
                                        className="w-4 h-4 flex-shrink-0"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" 
                                        />
                                    </svg>
                                    <a 
                                        href={`mailto:${contact.email}`}
                                        className="ml-2 text-black text-lg font-extralight hover:text-red-500 transition-colors truncate"
                                    >
                                        {contact.email}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactCard;