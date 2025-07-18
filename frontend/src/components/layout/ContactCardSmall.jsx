import { useState } from 'react';
import ContactMenuBar from "./ContactCardMenu";
import ContactCardPhotoSmall from '../ui/ContactCardPhoto';
import { useNavigate } from 'react-router';

const ContactCardSmall = ({contact = {}}) => {
    // Add this state declaration
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [contactPhoto, setContactPhoto] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        isFavorite: false
        });

    const handleClickContact = () => {
        navigate(`myspace/contact/${contact._id}`, { replace: true });
    }

    const handleClickCategory = () => {
        navigate(`myspace/category/${category._id}`, { replace: true });
    }

    return (
         <div className="min-h-screen bg-white w-full dark:bg-black relative justify-items top-[70px] bottom-[300px] left-0 right-0 mx-auto px-4 py-10" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Login Card with Photo*/}
            <div className="bg-gray-50 rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[380px] h-fit absolute left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(0, 0, 0, 0.3)'
                 }}>
                   
                 {/* Photo Field  */}
                <div className="flex justify-end px-5 pt-2"> 
                    {/* Photo Small */}
                    <div className="flex flex-col items-center relative pb-1">
                        <ContactCardPhotoSmall 
                            photo={contactPhoto}
                            name="Contact"
                            className=""
                        />
                    </div>
                    {/* Dropdown Menu Button */}
                    <span>

                    <ContactMenuBar 
                        isMenuOpen={isMenuOpen} 
                        setIsMenuOpen={setIsMenuOpen} 
                    />
                    </span>
                </div>

                {/* Name & Category */}
                <div className= "w-full relative justify-items">
                    <h5 className="mb-1 text-2xl text-center font-medium text-black hover:text-red-500" onClick="handleClickContact">{contact.first_name} {contact.last_name}</h5>
                    <p className="text-lg text-black text-center -mt-2  hover:text-red-500">{contact.category.name}</p>
                </div>

                {/* Contact Details */}
                <div className="w-full relative justify-items flex flex-col mt-5 mb-5 space-y-1">
                    <div className="flex items-center justify-between w-full ml-2">
                        {/* City and Country */}
                        <span className="text-black font-text text-normal font-light">{contact.city}, {contact.country}</span>
                        
                        {/* Favorite Star */}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                            className="flex items-center hover:scale-110 transform"
                            aria-label={formData.isFavorite ? "Unmark as favorite" : "Mark as favorite"}
                        >
                            <svg 
                                className={`w-7 h-7 ${
                                    formData.isFavorite ? 'text-red-500 hover:text-yellow-300' : 'text-black hover:text-yellow-300'
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
                    <div class="relative left flex items-center pointer-events-none ml-2 dark:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                        </svg>
                        <span className="ml-4 text-blue-800 text-medium font-light">{contact.phone}</span>
                    </div>
                    <div class="relative flex items-center pointer-events-none ml-2 dark:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>

                        <span className="ml-4 text-blue-800 text-medium font-light">{contact.email}</span>
                    </div>
                </div>           
            </div>

            {/* Main Login Card without Photo*/}
            <div className="bg-gray-50 mt-10 rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[380px] h-fit absolute left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(0, 0, 0, 0.3)'
                 }}>
                 <div className="flex justify-end px-5 pt-2">
                 <ContactMenuBar 
                        isMenuOpen={isMenuOpen} 
                        setIsMenuOpen={setIsMenuOpen} 
                    />
                </div>

                {/* Name & Category */}
                <div className= "w-full relative justify-items ">
                    <h5 className="mb-1 text-2xl text-center font-medium text-black">{contact.first_name} {contact.last_name}</h5>
                    <p className="text-lg text-black text-center -mt-2">{contact.category.name}</p>
                </div>

                {/* Contact Details */}
                <div className="w-full relative justify-items flex flex-col mt-5 mb-3 space-y-1">
                    <div className="flex items-center justify-between w-full ml-2">
                        {/* City and Country */}
                        <span className="text-black font-text text-normal font-light">{contact.city}, {contact.country}</span>
                        
                        {/* Favorite Star */}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                            className="flex items-center hover:scale-110 transform"
                            aria-label={formData.isFavorite ? "Unmark as favorite" : "Mark as favorite"}
                        >
                            <svg 
                                className={`w-7 h-7 ${
                                    formData.isFavorite ? 'text-red-500 hover:text-yellow-300' : 'text-black hover:text-yellow-300'
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
                    <div class="relative left flex items-center pointer-events-none ml-2 dark:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                        </svg>
                        <span className="ml-4 text-blue-800 text-medium font-light">{contact.phone}</span>
                    </div>
                    <div class="relative flex items-center pointer-events-none ml-2 dark:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>

                        <span className="ml-4 text-blue-800 text-medium font-light">{contact.email}</span>
                    </div>
                </div>           
            </div>

        </div>
    )
}

export default ContactCardSmall;