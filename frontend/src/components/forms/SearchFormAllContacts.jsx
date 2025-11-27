import { useState, useEffect, useRef } from 'react';
import { HiSearch, HiX } from 'react-icons/hi';
import {buttonStyles} from '../ui/Buttons';
import { getCategories } from '../../apiCalls/contactsApi';
import { useAuthContext } from '../../context/AuthContextProvider';

const SearchFormAllContacts = ({ onSearch, resetTrigger }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    categories: [],
    contactedFilter: null,
    toContactFilter: null,
    favoriteFilter: null
  });
  const { authFetch } = useAuthContext();

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState([]);

  // LOAD CATEGORIES FOR TOGGLE MENU
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories(authFetch);
       
        setCategories(categoriesData || []);
      } catch (error) {   
        console.error('Failed to load categories:', error);
        setCategories([]);
      }
    };
    loadCategories();
  }, [authFetch]);

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

  // Handle reset trigger from parent component DROPDOWN
  useEffect(() => {
    if (resetTrigger > 0) {
      setSearchTerm('');
      setFormData({
        categories: [],
        contactedFilter: null,
        toContactFilter: null,
        favoriteFilter: null
      });
      setShowCategoryDropdown(false);
    }
  }, [resetTrigger]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value, formData.categories, formData.contactedFilter, formData.toContactFilter, formData.favoriteFilter);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim(), formData.categories, formData.contactedFilter, formData.toContactFilter, formData.favoriteFilter);
    }
  };

  const handleCategorySelect = (category) => {

    
    const isSelected = formData.categories.some(cat => cat.id === category.id);
    let updatedCategories;
    
    if (isSelected) {
      updatedCategories = formData.categories.filter(cat => cat.id !== category.id);
    } else {
      if (formData.categories.length < 3) {
        updatedCategories = [...formData.categories, { name: category.name, id: category.id }];
      } else {
        return;
      }
    }
    
    setFormData(prev => ({ 
      ...prev, 
      categories: updatedCategories
    }));
    
    if (onSearch) {
      onSearch(searchTerm.trim(), updatedCategories, formData.contactedFilter, formData.toContactFilter, formData.favoriteFilter);
    }
  };

  const handleContactedToggle = (value) => {
    const newValue = formData.contactedFilter === value ? null : value;
    setFormData(prev => ({ 
      ...prev, 
      contactedFilter: newValue
    }));
    
    if (onSearch) {
      onSearch(searchTerm.trim(), formData.categories, newValue, formData.toContactFilter, formData.favoriteFilter);
    }
  };

  const handleToContactToggle = (value) => {
    const newValue = formData.toContactFilter === value ? null : value;
    setFormData(prev => ({ 
      ...prev, 
      toContactFilter: newValue
    }));
    
    if (onSearch) {
      onSearch(searchTerm.trim(), formData.categories, formData.contactedFilter, newValue, formData.favoriteFilter);
    }
  };

  const handleFavoriteToggle = (value) => {
    const newValue = formData.favoriteFilter === value ? null : value;
    setFormData(prev => ({ 
      ...prev, 
      favoriteFilter: newValue
    }));
    
    if (onSearch) {
      onSearch(searchTerm.trim(), formData.categories, formData.contactedFilter, formData.toContactFilter, newValue);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-8">
      <form ref={searchRef} onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* Main Search Bar */}
          <div className="flex bg-gray-100 hover:bg-red-50 rounded-xl items-center gap-0 relative" ref={dropdownRef}
            style={{ 
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}>
            
            {/* Category Dropdown Button */}
            <button 
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="inline-flex w-[138px] py-3 items-center rounded-xl px-4 text-[15px] font-extralight text-center text-gray-800 hover:bg-red-50 bg-gray-100 dark:text-black hover:text-red-500 hover:dark:bg-red-100 hover:dark:text-red-500" 
            >
              <span className="font-extralight tracking-wider">
                Categories
              </span>
              <svg 
                className={`w-4 h-4 ml-2 text-black font-extralight ${!showCategoryDropdown ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Category Dropdown Menu */}
            {showCategoryDropdown && (
              <div className="absolute bg-white rounded-2xl shadow-lg w-[200px] top-full mt-1 left-0 z-20 max-h-60 overflow-y-auto">
                {categories.length > 0 ? (
                  categories.map((category) => {
                    const isSelected = formData.categories.some(cat => cat.id === category.id);
                    const isDisabled = !isSelected && formData.categories.length >= 3;
                    
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => !isDisabled && handleCategorySelect(category)}
                        disabled={isDisabled}
                        className={`w-full text-left font-extralight tracking-wide text-[16px] px-3 py-2 flex items-center justify-between transition-colors ${
                          isSelected 
                            ? 'bg-red-50 text-red-500' 
                            : isDisabled
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-black hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        <span>{category.name}</span>
                        {isSelected && (
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-gray-400 text-sm font-extralight italic">
                    No categories available
                  </div>
                )}
              </div>
            )}         

            {/* Search Input Field */}
            <div className="relative flex-1 -ml-3">
              <input 
                type="search" 
                id="search-dropdown" 
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="rounded-e-xl pt-2.5 pb-2.5 px-4 -mt-2 -mb-2 w-full text-normal font-extralight border-1 border-white text-black placeholder-gray-200 placeholder-font-light placeholder-text-sm bg-white dark:bg-white dark:placeholder-gray-300 focus:outline-none focus:border-white"
                placeholder="search..."
              />
            </div>
          </div>

          {/* Filter Buttons Row - Pretty Pills */}
          <div className="flex gap-3 flex-wrap items-center">
            
            {/* Favorites Filter */}
            <button
              type="button"
              onClick={() => handleFavoriteToggle(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-extralight tracking-wide text-[14px]  ${
                formData.favoriteFilter === true
                  ? 'bg-red-50 text-red-500 shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill={formData.favoriteFilter === true ? "currentColor" : "none"}
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="size-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              <span>favorites</span>
            </button>

            {/* Reminder Filter */}
            <button
              type="button"
              onClick={() => handleToContactToggle(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-extralight tracking-wide text-[14px] ${
                formData.toContactFilter === true
                  ? 'bg-red-50 text-red-500 shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill={formData.toContactFilter === true ? "currentColor" : "none"}
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="size-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
              <span>reminder</span>
            </button>

            {/* Contacted Filter */}
            <button
              type="button"
              onClick={() => handleContactedToggle(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-extralight tracking-wide text-[14px]  ${
                formData.contactedFilter === true
                  ? 'bg-red-50 text-red-500 shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill={formData.contactedFilter === true ? "currentColor" : "none"}
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="size-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>contacted</span>
            </button>

            
          </div>

        </div>
      </form>
    </div>
  );
};

export default SearchFormAllContacts;