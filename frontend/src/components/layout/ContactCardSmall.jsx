import { useState } from 'react';
import ContactMenuBar from "./ContactCardMenu";
import ContactCardPhotoSmall from '../ui/ContactCardPhoto';
import { useNavigate } from 'react-router';

const ContactCardSmall = ({contact = {}}) => {

    console.log(contact)
    console.log(contact.category)
    console.log(contact.category?.name)

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
         <div className="bg-white dark:bg-black relative justify-items " //border border-purple-500
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            <div className="relative bg-gray-50 min-w-96 max-w-md rounded-3xl p-5 z-10 overflow-visible  h-fit left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(0, 0, 0, 0.3)'
                 }}>

                 
                <div className="flex items-center justify-between w-full ml-2 mt-2">
                    {/* Name & Category */}
                    <div className= "w-full relative justify-items">
                        <h5 className="mb-1 ml-14 text-2xl text-center font-medium text-black">
                            <a 
                                href={`contacts/${contact.id}`}
                                className=" hover:text-red-500 transition-colors"
                                >
                                {contact.first_name} {contact.last_name}
                            </a>
                        </h5>
                    </div>
                    <span className="flex justify-end px-5 pt-2">
                    <ContactMenuBar 
                            isMenuOpen={isMenuOpen} 
                            setIsMenuOpen={setIsMenuOpen} 
                        />
                    </span>
                </div>
                <p className="text-lg text-black text-center -mt-2 mb-6">{contact.category?.name}</p>
                

                {/* Contact Details */}
                <div className="w-full relative justify-items flex flex-col mt-5 mb-4 space-y-1">
                    <div className="flex items-center justify-between w-full mb-1">
                        {/* City and Country */}
                        <span className="text-black font-text text-normal font-light ml-4">{contact.city ? contact.city : " no city"}, {contact.country ? contact.country : "nor country"}</span>
                        
                        {/* Favorite Star */}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                            className="flex items-center hover:scale-110 transform -mr-3"
                            aria-label={formData.isFavorite ? "Unmark as favorite" : "Mark as favorite"}
                        >
                            <svg 
                                className={`w-6 h-6 mr-7 ${
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

                    {/* Phone Number */}
                    <div className="relative left flex items-center ml-4 dark:text-black">
                        {/* Phone Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                        </svg>
                        {/* Number */}
                        <span>
                            <a 
                                href={`tel:${contact.phone}`}
                                className="ml-4 text-blue-800 text-lg font-light hover:text-red-500 transition-colors"
                                >
                                {contact.phone}
                            </a>
                        </span>
                    </div>

                    {/* Email Address */}
                    <div className="relative flex items-center ml-4 dark:text-black">
                        {/* email icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>

                        {/* email address */}
                        <span>
                            <a 
                                href={`mailto:${contact.email}`}
                                className="ml-4 text-blue-800 text-lg font-light hover:text-red-500 transition-colors"
                            >
                                {contact.email}
                            </a>
                        </span>
                    </div>
                </div>  
            </div>

        </div>
    )
}

export default ContactCardSmall;