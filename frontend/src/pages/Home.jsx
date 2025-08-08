import { Link } from 'react-router-dom'
import CircleButton from '../components/ui/Buttons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuthContext } from "../context/AuthContextProvider";
import { getContacts } from "../apiCalls/contactsApi";
import { authMe } from '../apiCalls/authApi';
import ContactCloud from '../components/ui/ContactCloud';



function Home() {

  const navigate = useNavigate()
  const { accessToken, logout } = useAuthContext();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  // Guard to prevent duplicate API Calls
  const dataFetched = useRef(false);
  const lastAccessToken = useRef(null);

  // Hover Create Contact Button
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // This will run every time the Home component mounts
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      if (lastAccessToken.current !== accessToken) {
        dataFetched.current = false;
        lastAccessToken.current = accessToken;
      }

      // Guard against duplicate calls
      if (!accessToken || dataFetched.current) return;
      dataFetched.current = true;

      try {
        setIsLoading(true);

        const [userData, contactsData] = await Promise.all ([
          authMe(accessToken).catch(() => { 
            return {first_name: 'Friend'};
          }), 
          getContacts(accessToken).catch(() => [])
        ]);
        
        console.log("Data successfully fetched!", userData, contactsData)
        const firstName = userData?.first_name || 'friend';
        setUserName(firstName.toLowerCase());

        //set Contacts
        setContacts(contactsData || []);

      } catch (error) {
        console.error('Error fetching initial data:', error);
        setUserName('Friend');
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);


  const handleLogout = () => {
  logout();
  navigate('/login');
  };

  const handleCreateButton = () => {
    navigate('/myspace/newcontact')
  };

  const contactsCount = contacts.length
  const favoriteContacts = Array.isArray(contacts) 
  ? contacts.filter(contact => contact.is_favorite) 
  : [];
  

  return (
    <div className="container mx-auto px-8 py-28 ">
      
      {/* 1. Part: Text Section */}
      <div className="">
        {/* Header */}
        <h1 className="text-2xl font-heading font-light text-gray-900 dark:text-white mb-7">
          hello <span className="font-text text-red-500 text-3xl font-light">{userName}</span>.
        </h1>
      
        {/* Main Part */}
        <div className="text-2xl font-text font-light text-black dark:text-white mb-7">
          <p>welcome to your very own personal space.</p>
          <p className="mb-10">keep track of all your connections that matter to you.</p>
          <p className="text-2xl font-text text-black dark:text-white">
            you already have collected{" "}
            <Link to="/myspace/contacts">
              <span className="font-text font-normal text-red-500 dark:text-red-500 hover:text-red-600 dark:hover:text-red-600 transition-colors">
                {isLoading ? '0' : contactsCount}
              </span>
            </Link>
            {" "}contact{contactsCount !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>
        
      {/* 2. Part: Form Section */}
        {/* Contact Cloud Component */}  
        <div className=" pt-9 pb-16 min-w-[400px] max-w-[650px]">
          <div className="relative z-10 -mb-12 w-fit ml-auto">
            
            {/* Conditional tooltip */}
            {showTooltip && (
              <div className="absolute font-text text-right font-normal top-10 right-10 tracking-wider -translate-x-1/2 px-3  text-red-500 text-base rounded-lg whitespace-nowrap z-10">
                new contact.
              </div>
            )}

            <CircleButton 
              size="large"
              variant="dark"
              className="font-semibold font-text text-2xl bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:border-red-500"
              style={{ 
                marginTop: '3rem', 
                marginLeft: 'auto',
                display: 'block' 
              }}
              onClick={handleCreateButton}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              create.
            </CircleButton>
          </div>

          <div className="relative">
              {/* Contact Cloud Component */}
              {!isLoading && <ContactCloud contacts={favoriteContacts} />}
          </div>

          <div className="relative -mt-24 relativ z-10 w-fit ml-auto">
                <CircleButton 
                  size="large"
                  variant="dark"
                  className="font-semibold font-text bg-black hover:bg-red-600 dark:bg-red-500 dark:border-red-500"
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
        </div> 
    </div> 
  );
}

export default Home;