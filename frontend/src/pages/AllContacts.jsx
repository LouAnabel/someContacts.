import ContactCardSmall from "../components/layout/ContactCardSmall"
import ContactCardSmallPhoto from "../components/layout/ContactCardSmallPhoto";
import { getContacts } from "../apiCalls/contactsApi";
import { useEffect, useState, useRef } from "react";
import { useAuthContext } from "../context/AuthContextProvider";
import { useNavigate } from "react-router";
import CircleButton from "../components/ui/Buttons";



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


export default function AllContacts() {

  const [contacts, setContacts] = useState([]);
  const { accessToken } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // GUARDS to prevent duplicate API calls
  const contactsFetched = useRef(false);

  useEffect(() => {
    const fetchContacts = async () => {
      
      if (!accessToken ) {
        console.log("accessToken is not available")
        setIsLoading(false);
        return;
      }

      contactsFetched.current = true; // Mark as fetching
        
      try {
        setIsLoading(true);
        setError(null);

        const contactsData = await getContacts(accessToken);
        console.log('Contacts data:', contactsData); 
        setContacts(contactsData);

      } catch (error) {
        setError("Failed to fetch contacts. Please try again later.");
        console.error('Error fetching contacts:', error);
        contactsFetched.current = false;
      
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [accessToken]);

  const handleSubmit = () => {
    navigate('/myspace/newcontact', { replace: true });
  };

  const handleGoBack = () => {
  navigate(-1);
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

  // error handling if no contacts found
  if (!contacts || contacts.length === 0) {
    return (
      <div className="container py-20">
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

  // Render contacts if available
  return (
    <div className="w-full 2xl:flex 2xl:flex-col 2xl:items-center">
      {/* Header Part */}
      <div className="w-full justify-content text-center">
        <h1 className="pt-10 text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2 mt-6">
          <span className="px-2">
            <Button 
                  onClick={() => navigate('/myspace/')}
                  className="text-black dark:text-white hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        className="size-6"
                        fill="currentColor"
                    >
                    <path fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                  </svg>
                </Button>
          </span>
          All <span className="text-red-500">{contacts.length} </span> Contacts
        </h1>
      </div>


      <div className="p-10 gap-10 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 max-w-screen-2xl"> 
        {contacts.map((contact, index) => {
          // Create a more reliable key
          const contactKey = contact.id || contact._id || `contact-${index}`;
          
          return (
            <ContactCardSmall
              key={contactKey}
              contact={contact}
            />
          );
        })}
      </div>
    </div>
  );
}