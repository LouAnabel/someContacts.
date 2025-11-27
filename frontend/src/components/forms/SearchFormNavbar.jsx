import { useState, useEffect, useRef } from 'react';
import { HiX } from 'react-icons/hi';
import {buttonStyles} from '../ui/Buttons';
import { getCategories, getContacts } from '../../apiCalls/contactsApi';
import { useAuthContext } from '../../context/AuthContextProvider';
import { useNavigate } from 'react-router-dom';

const SearchForm = ({ onSearch }) => {

  const { authFetch, accessToken } = useAuthContext(); 
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  const [quickSearchTerm, setQuickSearchTerm] = useState('');

  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [showQuickResults, setShowQuickResults] = useState(false);


  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const quickSearchRef = useRef(null);

  // Load contacts for quick search
  useEffect(() => {
    const loadContacts = async () => {
      try {
        if (accessToken) {
          const contactsData = await getContacts(authFetch);
          setContacts(contactsData || []);
        }
      } catch (error) {
        console.error('Failed to load contacts for quick search:', error);
        setContacts([]);
      }
    };
    loadContacts();
  }, [accessToken, authFetch]);

  // Handle quick search filtering
  useEffect(() => {
    if (quickSearchTerm.trim() && quickSearchTerm.length >= 1) {
      const term = quickSearchTerm.toLowerCase().trim();
      const filtered = contacts.filter(contact => {
        const firstName = contact.first_name?.toLowerCase() || '';
        const lastName = contact.last_name?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        return firstName.includes(term) ||
               lastName.includes(term) ||
               fullName.includes(term);
      }).slice(0, 8); // Limit to 8 results
      
      setFilteredContacts(filtered);
      setShowQuickResults(true);
    } else {
      setFilteredContacts([]);
      setShowQuickResults(false);
    }
  }, [quickSearchTerm, contacts]);

  const handleContactSelect = (contact) => {
    // Navigate to contact detail page
    navigate(`/myspace/contacts/${contact.id}`);
    setQuickSearchTerm('');
    setShowQuickResults(false);
    setIsOpen(false);
  };

  const handleSearchToggle = () => {
    setIsOpen(!isOpen);
    // Clear search term when closing
    if (isOpen) {
      setQuickSearchTerm('');
      setShowQuickResults(false);
      if (onSearch) {
        onSearch('', null);
      }
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search on mobile when clicking outside
      if (isOpen && searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuickSearchTerm('');
        setShowQuickResults(false);
        if (onSearch) {
          onSearch('', null);
        }
      }

      // Close quick search results when clicking outside
      if (quickSearchRef.current && !quickSearchRef.current.contains(event.target)) {
        setShowQuickResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onSearch]);

  return (
    <div ref={searchRef} className="relative">
      {/* Search Toggle Button */}
      <button
        type="button"
        onClick={handleSearchToggle}
        className={`mb-1 rounded-lg text-sm ${buttonStyles.base} ${
          isOpen ? buttonStyles.active : buttonStyles.normal
        }`}
      >
        {isOpen ? (
          <HiX className="w-6 h-6" />
        ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
              </svg>
        )}
        <span className="sr-only">{isOpen ? 'Close search' : 'Search'}</span>
      </button>

      {/* Search Bar (dropdown) */}
      {isOpen && (
        <div className="absolute top-19 mt-2 md:-right-80 -right-16 z-50">
          {/* Quick Search Section */}
          <div className="mb-4" ref={quickSearchRef}>
            <div className="relative">
              <input
                type="text"
                value={quickSearchTerm}
                onChange={(e) => setQuickSearchTerm(e.target.value)}
                placeholder="Quick find contact..."
                className="w-[430px] px-4 py-2 text-[16px] font-extralight border border-red-200 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-100 focus:border-red-200"
              />
            </div>

            {/* Quick Search Results Dropdown */}
            {showQuickResults && filteredContacts.length > 0 && (
              <div className="absolute top-full -mt-2 w-[322px] lg:w-[322px] md:w-[280px] sm:w-[250px] bg-white border border-red-100 rounded-lg shadow-md z-60 h-15 max-h-60 overflow-y-auto">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleContactSelect(contact)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-white last:border-b-0"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium text-sm">
                      {contact.first_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-light text-gray-900 text-sm">
                        {contact.first_name} {contact.last_name}
                      </div>
                      {contact.company && (
                        <div className="text-xs text-gray-500 truncate">
                          {contact.company}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {showQuickResults && quickSearchTerm.trim() && filteredContacts.length === 0 && (
              <div className="absolute top-full mt-1 w-[322px] lg:w-[322px] md:w-[280px] sm:w-[250px] bg-white border border-gray-200 rounded-lg shadow-lg z-60 px-4 py-3">
                <div className="text-sm font-extralight text-gray-500 text-center">
                  No contacts found for "{quickSearchTerm}"
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchForm;