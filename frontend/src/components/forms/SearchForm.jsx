import { useState, useEffect, useRef } from 'react';
import { HiSearch, HiX } from 'react-icons/hi';
import {buttonStyles} from '../ui/Buttons';

const SearchForm = ({ 
  placeholder = "search...",
  onSearch, 
  isMobile = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleSearch = (value) => {
    console.log('Searching for:', value);
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCategorySelect = (category) => {
    console.log('Selected category:', category);
    setIsDropdownOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Clear search term when closing
    if (isOpen) {
      setSearchTerm('');
      if (onSearch) {
        onSearch('');
      }
    }
  };

  // Close search when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        if (onSearch) {
          onSearch('');
        }
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onSearch, isMobile]);

  return (
    <div ref={searchRef}>
      {/* Search Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`p-2 rounded-lg text-sm ${buttonStyles.base} ${
          isOpen ? buttonStyles.active : buttonStyles.normal
        }`}
       >
        {isOpen ? (
          <HiX className="w-6 h-6" />
        ) : (
          <HiSearch className="w-5 h-5" />
        )}
        <span className="sr-only">{isOpen ? 'Close search' : 'Search'}</span>
      </button>
        
      {/* Mobile Search Bar (dropdown) */}
      {isOpen && (
        <div className="absolute top-19 mt-2 right-6 z-50">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-0 relative" ref={dropdownRef}>
              <button 
                id="dropdown-button" 
                onClick={toggleDropdown}
                className="inline-flex items-center py-2 px-4 text-sm font-light text-center text-white bg-red-500 rounded-s-lg hover:bg-red-200 hover:text-red-500 hover:dark:bg-red-200 hover:dark:text-red-500" 
                type="button"
              >
                <span className="font-light tracking-wider">Categories</span>
                <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute bg-black bg-opacity-80 rounded-xl shadow-sm shadow-gray-200 dark:bg-white w-44 top-full z-10 ">
                  <ul className="py-4 text-sm font-light text-white dark:text-black tracking-wider ">
                    <li>
                      <button 
                        type="button" 
                        onClick={() => handleCategorySelect('Caster')}
                        className="inline-flex w-full px-4 py-2 hover:text-red-500  dark:hover:text-red-500"
                      >
                        Caster
                      </button>
                    </li>
                    <li>
                      <button 
                        type="button" 
                        onClick={() => handleCategorySelect('Producer')}
                        className="inline-flex w-full px-4 py-2 hover:text-red-500 dark:hover:text-red-500"
                      >
                        Producer
                      </button>
                    </li>
                  </ul>
                </div>
              )}

              {/* Search field */}
              <div className="relative flex-1">
                <input 
                  type="search" 
                  id="search-dropdown" 
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="border-white rounded-md py-3 px-4 w-full text-sm dark:border-0 text-black placeholder-gray-300 bg-gray-50 dark:placeholder-gray-300 dark:text-black" 
                  placeholder={placeholder}
                  required 
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="py-2.5 px-2.5 text-sm font-medium bg-black bg-red-500 text-white rounded-e-md hover:bg-red-200 hover:text-red-500 dark:hover:bg-red-200 hover:dark:text-red-500"
              >
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
                <span className="sr-only">search</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default SearchForm;