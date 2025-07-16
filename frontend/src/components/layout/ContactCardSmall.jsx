import { useState } from 'react';
import ContactMenuBar from "./ContactCardMenu";
import ContactCardPhotoSmall from '../ui/ContactCardPhoto';

const ContactCardSmall = ({contact}) => {
    // Add this state declaration
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [contactPhoto, setContactPhoto] = useState(null);

    return (
         <div className="min-h-screen bg-white w-full dark:bg-black p-6 relative justify-items top-[100px]" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Login Card */}
            <div className="bg-gray-50 rounded-3xl p-5 relative z-10 overflow-visible w-[75vw] min-w-[260px] max-w-[480px] h-fit absolute left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(0, 0, 0, 0.3)'
                 }}>
                   
                  
                <div className="flex justify-end px-5 pt-2"> 
                    {/* Photo Small */}
                    <div className="flex flex-col items-center relative pb-1">
                        <ContactCardPhotoSmall 
                            photo={contactPhoto}
                            name="Contact"
                            className=""
                        />
                    </div>
                    <span>
                    {/* Dropdown Menu Button */}
                    <ContactMenuBar 
                        isMenuOpen={isMenuOpen} 
                        setIsMenuOpen={setIsMenuOpen} 
                    />
                    </span>
                </div>
                <div className= "w-full relative justify-items ">
                    <h5 className="mb-1 text-xl text-center font-medium text-black">Maria Schrader</h5>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Visual Designer</span>
                    <div className="flex mt-4 md:mt-6">
                        <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add friend</a>
                        <a href="#" className="py-2 px-4 ms-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Message</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactCardSmall;