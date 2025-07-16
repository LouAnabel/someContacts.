import ContactCardSmall from "../components/layout/ContactCardSmall"
import { getContacts } from "../apiCalls/contact"
import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContextProvider";

export default function AllContacts() {

  const [contacts, setContacts] = useState([]);
  const { accessToken } = useAuthContext();
  
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await getContacts(accessToken);
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, [accessToken]);
  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="w-full flex flex-col items-center justify-center text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
        All Contacts
      </h1>
      <div className="">
        <ContactCardSmall />
      </div>
    </div>
  );
}

