import React, { useState } from 'react';
import PhotoField from "../components/ui/PhotoField";
import NewContactForm from "../components/forms/NewContactForm";
import { useNavigate } from 'react-router';

const Button = ({ children, onClick, className = "", ...props }) => {
  return (
    <button
      onClick={onClick}
      className={` text-black dark:text-white hover:text-red-500 dark:hover:text-red-500 transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const NewContact = () => {
    const [contactPhoto, setContactPhoto] = useState(null);
    const navigate = useNavigate()

    const handleSubmit = (formData) => {
        // Include photo in the submission
        const contactWithPhoto = {
            ...formData,
            photo: contactPhoto
        };
        // Handle the form submission here
        // Make API calls to create the contact, etc.
    };

    const handleCancel = () => {
        console.log('Form cancelled');
        // Handle cancel action (navigate back, reset form, etc.)
    };

    const handlePhotoUpload = () => {
        console.log('Photo upload initiated');
        // You can implement photo upload logic here
    };

    const handleTakePhoto = () => {
        console.log('Take photo initiated');
        // You can implement camera access logic here
    };



    return (
        <div className="flex flex-col items-center justify-center mx-auto lg:py-0 mt-10" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
            
            <div className="relative mt-4 mb-4 ">
                <Button 
                    onClick={() => navigate('/myspace/')}
                    className="text-black dark:text-white hover:text-red-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                        <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                        </svg>
                    </Button>
            </div>

            {/* Photo Field - Full width at top */}
            <div className="w-full pb-6">
                <PhotoField 
                    photo={contactPhoto}
                    name="New Contact"
                    onUpload={handlePhotoUpload}
                    onTakePhoto={handleTakePhoto}
                    className="w-full"
                />
            </div>
            
            {/* Contact Form */}
            <div className="w-full pb-40">
                <NewContactForm 
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
};

export default NewContact;