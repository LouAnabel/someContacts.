import ContactCardSmall from "../components/layout/ContactCardSmall"
import ContactCardSmallPhoto from "../components/layout/ContactCardSmallPhoto";
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
    <div className="w-full border border-green-500 2xl:flex 2xl:flex-col 2xl:items-center">
      <h1 className="w-full justify-content pt-10 text-center text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2 mt-6">
        All <span className="text-red-500">{contacts.length} </span> Contacts
      </h1>
      {/* <div className="p-10 gap-10 flex flex-col md:flex-row max-w-fit md:flex-wrap justify-center items-center border border-blue-500"> */}
      <div className="p-10 gap-10 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 border border-blue-500 max-w-screen-2xl">

   {contacts.map((contact) => (
            <ContactCardSmall
              key={contact._id || contact.id}
              contact={contact}
            />
          ))}
    
        {/* <div className="grid md:grid-cols-2 md:gap-10 lg:px-16 xl:grid-cols-3 -mb-80">
            {contacts.map((contact) => (
                <ContactCardSmallPhoto
                  key={contact._id || contact.id}
                  contact={contact}
                />
              ))} 
        </div> */}
      </div>
    </div>
  );
}



