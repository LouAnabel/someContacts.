import { useState } from 'react';
import ContactMenuBar from "./ContactCardMenu";
import ContactCardPhotoSmall from '../ui/ContactCardPhoto';
import { useNavigate, Link } from 'react-router';
import { useAuthContext } from '../../context/AuthContextProvider';
import { updateContact } from '../../apiCalls/contactsApi';
import FormDataToApiData from '../helperFunctions/FormToApiData'   

const ContactCardSmall = ({contact = {}, onContactUpdate, onDeleteRequest}) => {
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

            console.log('Updating favorite status to:', newFavoriteState);
            console.log('Contact ID:', contact.id);

            // Update local state immediately for better UX
            setLocalContact(prev => ({ ...prev, is_favorite: newFavoriteState }));

            // Send ONLY the favorite status - don't use FormDataToApiData helper
            const updatedContactData = {
                is_favorite: newFavoriteState
            };
            
            console.log('Sending to API:', updatedContactData);

            const apiResponse = await updateContact(accessToken, contact.id, updatedContactData);
            
            console.log('API Response:', apiResponse);
            
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
        <div className="bg-white dark:bg-black relative justify-items"
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            <div className="relative bg-white border border-red-100 min-w-[200px] max-w-[480px] rounded-3xl p-3 z-10 overflow-visible h-fit left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)'
                 }}
                >
                 
                <div className="flex items-center justify-between w-full ml-2 mt-2">
                    {/* Name & Category */}
                    <div className="w-full relative justify-items">
                        <h5 className="mb-1 ml-14 text-2xl text-center font-semibold text-black">
                            <Link 
                                to={`/myspace/contacts/${contact.id}`}
                                className="hover:text-red-500 transition-colors"
                            >
                                {contact.first_name} {contact.last_name}
                            </Link>
                        </h5>
                    </div>
                    <span className="flex justify-end px-5 pt-2">
                        <ContactMenuBar 
                            isMenuOpen={isMenuOpen}
                            setIsMenuOpen={setIsMenuOpen}
                            id={contact.id}
                            onDeleteRequest={onDeleteRequest} 
                        />
                    </span>
                </div>
                {/* Categories Display */}
                {contact && contact.categories && contact.categories.length > 0 && (
                    <div className="w-full flex justify-center mx-auto flex-wrap space-x-2 mt-1 mb-4">
                        {contact.categories.map((category, index) => (
                            <span key={category.id || index} className="inline-block text-center px-4 py-2 min-w-[90px] border border-red-50 bg-red-100 tracking-wide text-red-700 flex-wrap rounded-full text-[16px] font-extralight">
                                {category.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Contact Details */}
                <div className="w-full relative justify-items flex flex-col mt-4 mb-4">
                    <div className="flex items-center justify-between w-full mb-1">
                        {/* City and Country */}
                        <span className="text-black font-text text-[17px] font-extralight ml-4">
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
                            className={`flex items-center hover:scale-110 transform -mr-3 ${
                                isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            aria-label={localContact.is_favorite ? "Unmark as favorite" : "Mark as favorite"}
                        >
                            <svg 
                                className={`w-6 h-6 mr-7 transition-colors ${
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

                    {/* Phone Number */}
                    {contact.phone && (
                        <div className="relative left flex items-center ml-4 text-red-500">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth="1" 
                                stroke="currentColor" 
                                className="size-6"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" 
                                />
                            </svg>
                            <span>
                                <a 
                                    href={`tel:${contact.phone}`}
                                    className="ml-4 text-black text-lg font-extralight hover:text-red-500 transition-colors"
                                >
                                    {contact.phone}
                                </a>
                            </span>
                        </div>
                    )}

                    {/* Email Address */}
                    {contact.email && (
                        <div className="relative flex items-center ml-4 text-red-500">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth="1" 
                                stroke="currentColor" 
                                className="size-6"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" 
                                />
                            </svg>
                            <span>
                                <a 
                                    href={`mailto:${contact.email}`}
                                    className="ml-4 text-black text-lg font-extralight hover:text-red-500 transition-colors"
                                >
                                    {contact.email}
                                </a>
                            </span>
                        </div>
                    )}
                </div>  
            </div>
        </div>
    )
}

export default ContactCardSmall;