import { Link } from 'react-router-dom'
import CircleButton from '../components/ui/Buttons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthContext } from "../context/AuthContextProvider";
import { getContacts } from "../apiCalls/contactsApi";
import { authMe } from '../apiCalls/authApi';

function Home() {
  const navigate = useNavigate()
  const { accessToken, logout } = useAuthContext();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

 
  const getUserName = async () => {
    if (! accessToken) {
      setIsLoading(false);
        return;
    }

    try {
      const userData = await authMe(accessToken);
      const firstName = userData?.first_name || 'Friend';
      setUserName(firstName);
    } catch (error) {
      console.log("Failed to load userData", error);
      setUserName('Friend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserName();
  }, [accessToken]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        
        if (!accessToken) {
          console.error("Access token is not available.");
          setIsLoading(false);
          return;
        }

        const contactsData = await getContacts(accessToken);
        
        // Debug: Check what we're getting
        console.log('Contacts data:', contactsData);
        console.log('Is array?', Array.isArray(contactsData));
        
        // Handle both possible response formats
        const contactsArray = Array.isArray(contactsData) 
          ? contactsData 
          : contactsData.contacts || [];
          
        setContacts(contactsArray);
        
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setContacts([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContacts();
  }, [accessToken]);

  // Get contact count safely
  const contactCount = Array.isArray(contacts) ? contacts.length : 0;


  const handleLogout = () => {
  logout();
  navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-2xl font-heading font-light text-gray-900 dark:text-white mb-7">
        hello <span className="text-red-500 font-medium">{userName}.</span>
      </h1>
      
      <div className="text-xl font-text font-light text-black dark:text-white mb-6">
        <p>welcome to your very own personal space.</p>
        <p className="mb-10">keep track of all your connections that matter to you.</p>
        
        <p className="text-xl font-text text-black dark:text-white mb-6">
          you already have collected{" "}
          <Link to="/myspace/contacts">
            <span className="font-text font-semibold text-red-500 dark:text-red-500 hover:text-red-600 dark:hover:text-red-600 transition-colors">
              {isLoading ? '0' : contactCount}
            </span>
          </Link>
          {" "}contact{contactCount !== 1 ? 's' : ''}.
        </p>
      </div>
      
      <CircleButton 
        size="large"
        variant="dark"
        className="border border-white/30 bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:border-red-500"
        style={{ 
          marginTop: '3rem', 
          marginLeft: 'auto',
          display: 'block' 
        }}
        onClick={handleLogout}
      >
        log out.
      </CircleButton>
    </div> 
  );
}

export default Home;