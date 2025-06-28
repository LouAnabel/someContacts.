import { useState, useEffect, useRef } from 'react';
import { HiSearch, HiX } from 'react-icons/hi';
import { buttonStyles, searchStyles } from './ButtonStyles.jsx';

const Search = ({ 
  placeholder = "Search...",
  onSearch,
  className = "",
  isMobile = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef(null);

  const handleSearch = (value) => {
    console.log('Searching for:', value); // Fixed: now logs the new value
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isOpen, onSearch]);

  // Mobile version with toggle button
  if (isMobile) {
    return (
      <div ref={searchRef}>
        {/* Search Toggle Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`p-2.5 rounded-lg text-sm ${buttonStyles.base} ${
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
          <div className="absolute top-16 left-2 right-6 bg-white dark:bg-black">
            <div className="relative min-w-screen mx-auto">
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={searchStyles.mobile}
                autoFocus
              />
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version (always visible)
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className={searchStyles.desktop}
      />
      <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
    </div>
  );
};

export default Search;