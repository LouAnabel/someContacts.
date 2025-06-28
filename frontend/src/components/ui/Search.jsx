import { useState } from 'react';
import { HiSearch } from 'react-icons/hi';
import { buttonStyles, searchStyles } from '../styles/buttonStyles.js';

const Search = ({ 
  placeholder = "Search...",
  onSearch,
  className = "",
  isMobile = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value) => {
    console.log('Searching for:', searchTerm);
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Mobile version with toggle button
  if (isMobile) {
    return (
      <>
        {/* Search Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2.5 rounded-lg text-sm ${buttonStyles.base} ${
            isOpen ? buttonStyles.active : buttonStyles.normal
          }`}
        >
          <HiSearch className="w-5 h-5" />
          <span className="sr-only">Search</span>
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
      </>
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