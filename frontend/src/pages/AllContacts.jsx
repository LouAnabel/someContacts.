import ContactCardSmall from "../components/layout/ContactCardSmall"
import { getContacts } from "../apiCalls/contactsApi";
import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContextProvider";
import { useNavigate } from "react-router";
import CircleButton from "../components/ui/Buttons";

export default function AllContacts() {

  const [contacts, setContacts] = useState([]);
  const { accessToken } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
  
  const handleSubmit = () => {
    navigate('/myspace/newcontact', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-28">
        <h1 className="w-full flex flex-col items-center justify-center text-3xl font-heading font-bold text-gray-900 dark:text-white mb-10">
          All Contacts
        </h1>
        <div className="font-text text-red-500 tracking-wider text-center dark:white">
          You have no contacts added yet.
          <p>add a new contact now.</p>
        </div>
        
        <CircleButton
            size="small"
            variant="dark"
            className="border border-white/30 relative bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:border-red-500"
            style={{ 
                marginTop: '2rem', 
                marginLeft: 'auto',
                marginRight: 'auto', 
                display: 'block' 
            }}
                onClick={handleSubmit}>
          + 
        </CircleButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="w-full flex flex-col items-center justify-center text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2 mt-6">
        All {contacts.length} Contacts 
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20 lg:gap-0 lg:mx-2 lg:px-16 xl:grid-cols-3 xl:gap-20 xl:px-4 -mt-10">
        {contacts.map((contact) => (
          <ContactCardSmall
            key={contact._id || contact.id}
            contact={contact}
          />
        ))}
      </div>
    </div>
  );
}



