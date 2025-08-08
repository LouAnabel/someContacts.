import ContactCardSmall from "../components/layout/ContactCardSmall"
import ContactCardSmallPhoto from "../components/layout/ContactCardSmallPhoto";
import { getContacts, deleteContactById } from "../apiCalls/contactsApi";
import { useEffect, useState, useRef } from "react";
import { useAuthContext } from "../context/AuthContextProvider";
import { useNavigate } from "react-router";
import CircleButton from "../components/ui/Buttons";
import SearchFormAllContacts from "../components/forms/SearchFormAllContacts";

const Button = ({ children, onClick, className = "", ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`text-black dark:text-white hover:text-red-500 dark:hover:text-red-500 transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function AllContacts() {
  const navigate = useNavigate();
  const { accessToken } = useAuthContext();

  // Contact states
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]); // Store original unfiltered contacts
  const [filteredContacts, setFilteredContacts] = useState([]);
  
  // Search states
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState(null);


  // UI states
  const [errors, setErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Delete states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetSearchForm, setResetSearchForm] = useState(0);

  
  // GUARDS to prevent duplicate API calls
  const contactsFetched = useRef(false);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!accessToken) {
        console.log("accessToken is not available")
        setIsLoading(false);
        return;
      }

      contactsFetched.current = true; //fetching
        
      try {
        console.log("Trying to fetch data from API")
        setIsLoading(true);
        setErrors(null);

        const contactsData = await getContacts(accessToken);
        console.log('Contacts data:', contactsData); 
        
        // Add validation:
        if (!contactsData || !Array.isArray(contactsData)) {
          console.error('Invalid contacts data:', contactsData);
          setContacts([]);
          setAllContacts([]);
          setFilteredContacts([]);
          return;
        }

        // Set both filtered and all contacts
        setContacts(contactsData);
        setAllContacts(contactsData);
        setFilteredContacts(contactsData);

      } catch (error) {
        contactsFetched.current = false;
        setErrors("Failed to fetch contacts. Please try again later.");
        console.error('Error fetching contacts:', error);
        
        setContacts([]);
        setAllContacts([]);
        setFilteredContacts([]);
      
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [accessToken]);

  const handleSearch = (searchTerm, selectedCategory) => {
    console.log('Search term:', searchTerm);
    console.log('Selected category:', selectedCategory);
    
    setCurrentSearchTerm(searchTerm);
    setCurrentCategory(selectedCategory);
    
    let filtered = [...allContacts];
    
    // Filter by search term
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(contact => {
        const firstName = contact.first_name?.toLowerCase() || '';
        const lastName = contact.last_name?.toLowerCase() || '';
        const email = contact.email?.toLowerCase() || '';
        const phone = contact.phone?.toLowerCase() || '';
        const city = contact.city?.toLowerCase() || '';
        const company = contact.company?.toLowerCase() || '';
        
        return firstName.includes(term) ||
               lastName.includes(term) ||
               email.includes(term) ||
               phone.includes(term) ||
               city.includes(term) ||
               company.includes(term) ||
               `${firstName} ${lastName}`.includes(term);
      });
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory.id) {
      filtered = filtered.filter(contact => {
        // Adjust this based on how categories are stored in your contact objects
        return contact.category_id === selectedCategory.id || 
               contact.category?.id === selectedCategory.id ||
               contact.categories?.some(cat => cat.id === selectedCategory.id);
      });
    }
    
    setFilteredContacts(filtered);
    setContacts(filtered); // Update the contacts that are displayed
  };

  const clearSearchTerm = () => {
    handleSearch('', currentCategory);
    setResetSearchForm(prev => prev + 1); // Trigger SearchForm reset
  };

  const clearCategory = () => {
    handleSearch(currentSearchTerm, null);
    setResetSearchForm(prev => prev + 1); // Trigger SearchForm reset
  };

  // Update the clearSearch function to also trigger reset:
  const clearSearch = () => {
    setCurrentSearchTerm('');
    setCurrentCategory(null);
    setFilteredContacts(allContacts);
    setContacts(allContacts);

    // Trigger SearchForm reset by incrementing the reset counter
    setResetSearchForm(prev => prev + 1);
  };

  const handleDeleteRequest = (contact) => {
    setContactToDelete(contact);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteContact = async () => {
    setIsDeleting(true);

    try {
      await deleteContactById(accessToken, contactToDelete.id);
      
      // Update all contact arrays
      const updatedContacts = contacts.filter(contact => contact.id !== contactToDelete.id);
      const updatedAllContacts = allContacts.filter(contact => contact.id !== contactToDelete.id);
      const updatedFilteredContacts = filteredContacts.filter(contact => contact.id !== contactToDelete.id);
      
      setContacts(updatedContacts);
      setAllContacts(updatedAllContacts);
      setFilteredContacts(updatedFilteredContacts);
      
      setShowDeleteConfirmation(false); // Close modal on success
      setContactToDelete(null); // Clear selected contact

    } catch (error) {
      console.error('Error deleting contact:', error);
      setErrors(`Failed to delete contact: ${error.message}`);
      
    } finally {
      setIsDeleting(false);
    }
  };

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
  
  if (errors) {
    return (
      <div className="py-20 flex flex-col justify-center items-center min-h-screen">
          <Button 
            onClick={() => navigate('/myspace/')}
            className=" text-black dark:text-white hover:text-red-500 mb-5 -mt-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
          </Button>

          <p className="text-red-500 tracking-wide font-light">{errors}</p>

      </div>
    );
  }

  // error handling if no contacts found
  if (!allContacts || allContacts.length === 0) {
    return (
      <div className=" py-20 w-full flex flex-col items-center justify-center">

        <Button 
          onClick={() => navigate('/myspace/')}
          className="text-black dark:text-white hover:text-red-500 mb-5 -mt-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
        </Button>

        <h1 className=" text-3xl font-heading font-bold text-gray-900 dark:text-white mb-10">
          All Contacts
        </h1>
        <div className="font-text text-red-500 tracking-wider text-center dark:white">
          You have no contacts added yet.
          <p>add a new contact now.</p>
        </div>

        <CircleButton
          size="small"
          variant="dark"
          className="border border-white/30 relative font-semibold bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:border-red-500"
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
    <div className="w-full 2xl:flex 2xl:flex-col 2xl:items-center">
      
      {/* Header Part */}
      <div className="w-full text-center">
        <div className="relative items-center mt-14 -mb-14">
          <Button 
            onClick={() => navigate('/myspace/')}
            className="text-black dark:text-white hover:text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
        
        <div className="space-y-6">
          <h1 className="pt-10 text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2 mt-6">
            {currentSearchTerm || currentCategory ? (
              <>
                Found <span className="text-red-500">{contacts.length}</span> of {allContacts.length} Contacts
              </>
            ) : (
              <>
                All <span className="text-red-500">{contacts.length} </span> Contacts
              </>
            )}
          </h1>

          {/* Show active filters */}
          {(currentSearchTerm || currentCategory) && (
            <div className="flex justify-center items-center gap-2 mb-4 flex-wrap font-text">
              <span className="text-sm font-light tracking-wide text-gray-600 dark:text-white">Filtered by:</span>
              {currentSearchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-light tracking-wide dark:bg-white bg-red-300 text-black">
                  {currentSearchTerm}
                  <button
                    onClick={clearSearchTerm}  // Changed this
                    className="ml-1 text-lg text-blue-600 font-medium hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )}
              {currentCategory && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-light tracking-wide bg-red-200 dark:bg-white text-black">
                  {currentCategory.name}
                  <button
                    onClick={clearCategory}  // Changed this
                    className="ml-1 text-lg font-medium text-green-600 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearSearch}  // This already triggers reset
                className="text-sm tracking-wide font-light text-gray-600 dark:text-white hover:text-red-500 dark:hover:text-red-500 underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Centered Search Bar Container */}
          <div className="flex justify-center w-full px-4">
            <SearchFormAllContacts 
              onSearch={handleSearch} 
              resetTrigger={resetSearchForm}
            />
          </div>
        </div>
      </div>

      {/* ERROR MESSAGES */}
      {/* Show Contacts or No Results Message */}
      {contacts.length === 0 && (currentSearchTerm || currentCategory) ? (
        <div className="flex flex-col items-center justify-center py-20 font-light tracking-wide">
          <div className="text-red-500  text-lg mb-2">No contacts found</div>
          <div className="text-gray-700 text-sm mb-4">
            Try adjusting your search terms or clearing the filters
          </div>
          <button
            onClick={clearSearch}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="p-10 gap-10 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 max-w-screen-2xl"> 
          {contacts.map((contact, index) => {
            // Create a more reliable key
            const contactKey = contact.id || contact._id || `contact-${index}`;
            
            return (
              <ContactCardSmall
                key={contactKey}
                contact={contact}
                onDeleteRequest={() => handleDeleteRequest(contact)}
              />
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && contactToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
              <div className="bg-white rounded-3xl p-8 relative overflow-visible w-[85vw] min-w-[280px] max-w-[400px] mx-auto"
                  style={{ 
                    boxShadow: '0 8px 48px rgba(109, 71, 71, 0.35)'
                  }}>
                
                  {/* Warning Icon */}
                  <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                          <svg 
                              className="w-8 h-8 text-red-500" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                          >
                              <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                              />
                          </svg>
                      </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-center mb-4 text-black">
                      delete <span className="text-red-500">{contactToDelete.first_name || 'contact'}?</span>
                  </h2>
                  
                  {/* Message */}
                  <p className="text-center text-gray-600 font-light mb-8 leading-relaxed">
                      this action cannot be undone. all contact information, notes, and history will be permanently removed.
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                      {/* Cancel Button */}
                      <button
                          type="button"
                          onClick={() => {
                            setShowDeleteConfirmation(false);
                            setContactToDelete(null);
                          }}
                          disabled={isDeleting}
                          className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-light hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ fontSize: '16px' }}
                      >
                          cancel
                      </button>
                      
                      {/* Delete Button */}
                      <button
                          type="button"
                          onClick={handleDeleteContact}
                          disabled={isDeleting}
                          className="flex-1 py-3 px-6 rounded-xl bg-red-500 text-white font-light hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          style={{ fontSize: '16px' }}
                      >
                          {isDeleting ? (
                              <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  deleting...
                              </>
                          ) : (
                              'delete forever'
                          )}
                      </button>
                  </div>

                  {/* Show error if deletion fails */}
                  {errors && (
                      <p className="text-center text-red-600 text-sm mt-4 font-light">
                          {errors}
                      </p>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};