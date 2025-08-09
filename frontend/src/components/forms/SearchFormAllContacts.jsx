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
      setFormData(prev => ({ ...prev, category: null }));;
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
    <div className="w-[536px] lg:w-[620px] mx-auto px-8">
      <form ref={searchRef} onSubmit={handleSubmit}>
        <div className="-pl-1 -pb-2 flex border border-red-200 bg-gray-100 hover:bg-red-50 dark:bg-black rounded-xl items-center gap-0 relative" ref={dropdownRef}
        style={{ 
                     boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                 }}>
          {/* Category Dropdown Button */}
          <button 
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="inline-flex w-[138px] py-3 items-center rounded-xl px-4 text-[15px] font-extralight text-center text-gray-800 hover:bg-red-50 bg-gray-100 dark:text-white  hover:text-red-500 hover:dark:bg-red-200 hover:dark:text-red-500" 
          >
            <span className="font-extralight tracking-wider">
              {formData.category ? formData.category.name : 'Categories'}
            </span>
            <svg 
              className={`w-4 h-4 ml-2 text-black font-extralight transition-transform duration-200 ${!showCategoryDropdown ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Category Dropdown Menu */}
          {showCategoryDropdown && (
            <div className="absolute bg-white rounded-2xl shadow-lg border border-gray-200 dark:border-gray-200 w-[150px] top-full mt-1 left-0 z-20 max-h-60 overflow-y-auto">
              
              {/* Category options */}
              {categories.length > 0 ? (
                categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full text-left font-extralight tracking-wide text-gray-600 text-[16px] px-3 py-2 hover:bg-gray-100 ${
                      formData.category?.id === category.id 
                        ? 'bg-red-50 text-red-500' 
                        : 'text-black'
                    }`}
                  >
                    {category.name}
                  </button>
                ))
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
              className="rounded-e-xl pt-2.5 pb-2.5 px-4 -mt-2 -mb-2 w-full text-normal font-extralight border-1 border-white text-black placeholder-gray-200 placeholder-font-light placeholder-text-sm bg-white dark:bg-white dark:placeholder-gray-300 border-l-red-100 focus:outline-none focus:border-l-red-100 focus:border-white"
              placeholder="search..."
            />

          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFormAllContacts;