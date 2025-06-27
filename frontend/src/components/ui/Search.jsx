import { useState } from 'react';
import { HiSearch } from 'react-icons/hi';

const Search = ({ 
  placeholder = "Search...",
  onSearch,
  className = "",
  isMobile = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  // Mobile version with toggle button
  if (isMobile) {
    return (
      <>
        {/* Search Toggle Button */}
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2.5 rounded-lg text-sm transition-colors ${
                isOpen 
                ? 'text-red-500 hover:bg-red-200 dark:bg-black dark:text-red-500' // Active styles (same as hover)
                : 'text-black dark:text-white hover:bg-red-200 hover:text-red-500 dark:hover:bg-black dark:hover:text-red-500' // Normal styles
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
                className="w-full px-4 py-2 pl-10 bg-white dark:bg-white border border-gray-300 dark:border-gray-800 rounded-lg font-light text-gray-500 dark:gray-500"
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
        className="w-64 px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
      />
      <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
    </div>
  );
};

export default Search;