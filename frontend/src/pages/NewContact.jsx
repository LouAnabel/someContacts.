import React, { useState } from 'react';
import PhotoField from "../components/ui/PhotoField";
import ContactForm from "../components/forms/ContactForm";

const NewContact = () => {
    const [contactPhoto, setContactPhoto] = useState(null);

    const handleSubmit = (formData) => {
        console.log('New contact data submitted:', formData);
        // Include photo in the submission
        const contactWithPhoto = {
            ...formData,
            photo: contactPhoto
        };
        console.log('Complete contact data with photo:', contactWithPhoto);
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
        <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-start items-center text-black dark:text-white font-sans p-0" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
            
            {/* Photo Field - Full width at top */}
            <div className="w-full pt-[50px] pb-6">
                <PhotoField 
                    photo={contactPhoto}
                    name="New Contact"
                    onUpload={handlePhotoUpload}
                    onTakePhoto={handleTakePhoto}
                    className="w-full"
                />
            </div>
            
            {/* Contact Form */}
            <div className="flex flex-col items-center w-full">
                <ContactForm 
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
};

export default NewContact;