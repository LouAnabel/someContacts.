import { useState, useEffect, useRef } from 'react';
import { HiSearch, HiX } from 'react-icons/hi';
import {buttonStyles} from '../ui/Buttons';
import { getCategories } from '../../apiCalls/contactsApi';
import { useAuthContext } from '../../context/AuthContextProvider';

const SearchFormAllContacts = ({ onSearch }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState ({})
  const {accessToken} = useAuthContext();

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState([])


  // LOAD CATEGORIES FOR TOGGLE MENU
    useEffect(() => {
        const loadCategories = async () => {
            try {
                if (accessToken) {
                    const categoriesData = await getCategories(accessToken);
                    console.log("categoriesData:", categoriesData)
                    setCategories(categoriesData); // Just empty array, no defaults
                } else {
                    setCategories([]); // Empty array when no access token
                }
            } catch (error) {   
                console.error('Failed to load categories:', error);
                setCategories([]); // Empty array on error
            }
        };
        loadCategories();
    }, [accessToken]);


  const handleSearch = (value) => {
    console.log('Searching for:', value);
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value, formData.category);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim(), formData.category);
    }
  };

  const handleCategorySelect = (category) => {
    console.log('Selected category:', category);
    setFormData(prev => ({ 
      ...prev, 
      category: { name: category.name, id: category.id } 
    }));
    setShowCategoryDropdown(false);
    
    // Trigger search with new category if there's a search term
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim(), { name: category.name, id: category.id });
    }
  };

  const handleClearCategory = () => {
    setFormData(prev => ({ ...prev, category: null }));
    setShowCategoryDropdown(false);
    
    // Re-trigger search without category filter
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim(), null);
    }
  };

  const handleSearchToggle = () => {
    setIsOpen(!isOpen);
    // Clear search term when closing
    if (isOpen) {
      setSearchTerm('');
      setFormData({});
      if (onSearch) {
        onSearch('', null);
      }
    }
  };


return (
    <div ref={searchRef}>
      {/* Search Toggle Button */}
        <div className="absolute top-19 mt-2 right-8 z-50">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-0 relative" ref={dropdownRef}>
              {/* Category Dropdown Button */}
              <button 
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="inline-flex -mr-2 items-center py-2 px-4 text-sm font-light text-center text-white bg-red-500 rounded-s-lg hover:bg-red-200 hover:text-red-500 hover:dark:bg-red-200 hover:dark:text-red-500" 
              >
                <span className="font-light tracking-wider">
                  {formData.category ? formData.category.name : 'Categories'}
                </span>
                <svg 
                  className={`w-4 h-4 ml-2 transition-transform duration-200 ${!showCategoryDropdown ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Category Dropdown Menu */}
              {showCategoryDropdown && (
                <div className="absolute bg-white rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-[128px] -mt-1 top-full left-0 z-20 max-h-60  overflow-y-auto">
                  
                  
                  {/* Category options */}
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySelect(category)}
                        className={`w-full text-left font-light text-sm px-4 py-2 hover:bg-red-200 ${
                          formData.category?.id === category.id 
                            ? 'bg-red-50 text-red-600' 
                            : 'text-black'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-400 text-sm font-light italic">
                      No categories available
                    </div>
                  )}
                </div>
              )}         

              {/* Search Input Field */}
              <div className="relative flex-1 w-[265px]">
                <input 
                  type="search" 
                  id="search-dropdown" 
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="rounded-xl py-2 px-4 w-full text-normal font-light border-gray-200 text-black placeholder-gray-400 placeholder-font-light placeholder-text-sm bg-white dark:bg-white dark:placeholder-gray-300" 
                  placeholder="Search..."
                />
                
                {/* Show selected category indicator in input */}
                {formData.category && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      {formData.category.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearCategory();
                        }}
                        className="ml-1 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                )}
              </div>

              {/* Search Submit Button */}
              <button 
                type="submit" 
                className="py-2.5 px-3 text-sm -ml-1 font-medium bg-red-500 text-white rounded-e-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
                <span className="sr-only">Search</span>
              </button>
            </div>
          </form>
        </div>
    </div>
  );
};

export default SearchFormAllContacts;
