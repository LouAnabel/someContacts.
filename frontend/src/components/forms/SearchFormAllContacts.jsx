import { useState, useEffect, useRef } from 'react';
import { HiSearch, HiX } from 'react-icons/hi';
import {buttonStyles} from '../ui/Buttons';
import { getCategories } from '../../apiCalls/contactsApi';
import { useAuthContext } from '../../context/AuthContextProvider';

const SearchFormAllContacts = ({ onSearch, resetTrigger }) => {

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
                    setCategories(categoriesData);
                } else {
                    setCategories([]);
                }
            } catch (error) {   
                console.error('Failed to load categories:', error);
                setCategories([]);
            }
        };
        loadCategories();
    }, [accessToken]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle reset trigger from parent component
  useEffect(() => {
    if (resetTrigger > 0) {
      setSearchTerm('');
      setFormData({});
      setShowCategoryDropdown(false);
    }
  }, [resetTrigger]);

  const handleSearch = (value) => {
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
    const selectedCategory = { name: category.name, id: category.id };
    
    setFormData(prev => ({ 
      ...prev, 
      category: selectedCategory
    }));
    setShowCategoryDropdown(false);
    
    // Always trigger search when category is selected (with or without search term)
    if (onSearch) {
      onSearch(searchTerm.trim(), selectedCategory);
    }
  };

  const handleClearCategory = () => {
    setFormData(prev => ({ ...prev, category: null }));
    setShowCategoryDropdown(false);
    
    // Always trigger search when category is cleared (with or without search term)
    if (onSearch) {
      onSearch(searchTerm.trim(), null);
    }
  };

  return (
    <div className="w-[536px] lg:w-[620px] mx-auto px-7">
      <form ref={searchRef} onSubmit={handleSubmit}>
        <div className="flex border-gray-200 bg-red-200 dark:bg-black rounded-xl items-center gap-0 relative" ref={dropdownRef}
        style={{ 
                     boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)'
                 }}>
          {/* Category Dropdown Button */}
          <button 
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="inline-flex -mr-2 items-center py-2.5 px-4 text-sm font-light text-center text-black bg-red-200 rounded-s-lg hover:bg-red-200 hover:text-red-500 hover:dark:bg-red-200 hover:dark:text-red-500" 
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
            <div className="absolute bg-white rounded-lg shadow-lg border border-gray-200 dark:border-gray-200 w-[128px] -mt-1 top-full left-0 z-20 max-h-60 overflow-y-auto">
              
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
              className="rounded-xl py-2 px-4 w-full text-normal font-light border-1 border-red-200 text-black placeholder-gray-200 placeholder-font-light placeholder-text-sm bg-white dark:bg-white dark:placeholder-gray-300 focus:outline-none focus:border-gray-300"
              placeholder="search..."
            />

          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFormAllContacts;