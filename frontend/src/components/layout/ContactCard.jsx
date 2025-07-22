import React, { useState } from 'react';
import { getContacts } from "../../apiCalls/contactsApi";
import { useEffect} from "react";
import { useAuthContext } from "../../context/AuthContextProvider";
import { useNavigate } from "react-router";
import CircleButton from "../../components/ui/Buttons";
import ContactCardPhotoSmall from '../ui/ContactCardPhoto';


const ContactCard = () => {
    const [contacts, setContacts] = useState([]);
    const { accessToken } = useAuthContext();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contactPhoto, setContactPhoto] = useState(null);
    const [formData, setFormData] = useState({
        isFavorite: false
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                setIsLoading(true);
                setError(null); 

                if (!accessToken) {
                    setError("Access token is not available.");
                    setIsLoading(false);
                    return;
                }
                const contactsData = await getContacts(accessToken);
                setContacts(contactsData);

            } catch (error) {
                setError("Failed to fetch contacts. Please try again later.");
                console.error('Error fetching contacts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContacts();
    }, [accessToken]);


  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-white dark:bg-black" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

        {/* Photo Block */}
        <div className="w-full flex justify-center items-center mt-8">
            <ContactCardPhotoSmall 
                photo={contactPhoto}
                name="Contact"
                className=""
                />
        </div>
      
    </div>
  )
}

export default ContactCard;