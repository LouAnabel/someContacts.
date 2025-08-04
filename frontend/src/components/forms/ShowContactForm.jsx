
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContextProvider';
import { getContactById, getCategories, updateContact, deleteContactById } from '../../apiCalls/contactsApi';
import FormDataToApiData from '../helperFunctions/FormToApiData';
import ApiDataToFormData from '../helperFunctions/ApiToFormData';
import { validateDate } from '../helperFunctions/dateConversion';
import CircleButton from '../ui/Buttons';

const ShowContactForm = ({id}) => {
  const navigate = useNavigate();
  const { accessToken } = useAuthContext();
  
  // Loading state and Error State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [contactData, setContactData] = useState({});
  const [formData, setFormData] = useState({});
  

  // Edit Mode states
  const [isEditing, setIsEditing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({}); 

  // Form states for edit mode for Categories
  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Form states for edit mode
  const [showBirthdate, setShowBirthdate] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [links, setLinks] = useState([{ title: '', url: '' }]);


  // GUARDS to prevent duplicate API calls
  const contactFetched = useRef(false);
  const categoriesFetched = useRef(false);


  // Contact data fetching with guard
  useEffect(() => {
    const fetchContactData = async () => {
      // GUARD: Prevent duplicate calls
      if (!accessToken || !id || contactFetched.current) return;
      
      console.log('ShowContact: Starting contact fetch for ID:', id);
      contactFetched.current = true; // Mark as fetching
      
      try {
        setIsLoading(true);
        setError(null);

        const apiContactData = await getContactById(accessToken, id);
        console.log('Contact data received:', apiContactData);
        setContactData(apiContactData);
        
        const newFormData = ApiDataToFormData(apiContactData);
        console.log('Form data transformed:', newFormData);
        
        setFormData(newFormData);

        // Initialize optional sections with the NEW form data
        setShowBirthdate(!!newFormData.birthdate);
        setShowAddress(
          !!(newFormData.streetAndNr || newFormData.city || 
            newFormData.country || newFormData.postalcode)
        );
        setShowContactDetails(
          !!(newFormData.contactDate || newFormData.meetingPlace)
        );
        
        const hasLinks = newFormData.links && newFormData.links.length > 0;
        setShowLinks(hasLinks);
        setLinks(hasLinks ? newFormData.links : [{ title: '', url: '' }]);


      } catch (error) {
        console.error('Contact fetch failed:', error);
        setError(error.message || 'Failed to load contact data');
        setContactData({});
        setFormData({});
        contactFetched.current = false; // Reset on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, [accessToken, id]); // Only depend on accessToken and id


  // Categories loading with guard
  useEffect(() => {
    const loadCategories = async () => {
      // GUARD: Prevent duplicate calls
      if (!accessToken || categoriesFetched.current) return;
      
      categoriesFetched.current = true;

      try {
        const categoriesData = await getCategories(accessToken);
        setCategories(categoriesData);
      } catch (error) {   
        console.error('Categories fetch failed:', error);
        setCategories([]);
        categoriesFetched.current = false;
      }
    };

    loadCategories();
  }, [accessToken]); 

  // Reset guards when component unmounts or ID changes
  useEffect(() => {
    return () => {
      contactFetched.current = false;
      categoriesFetched.current = false;
    };
  }, [id]);


  const addCategory = async () => {
    if (newCategoryName.trim() && !isAddingCategory) {
      setIsAddingCategory(true);
      
      try {
        const categoryName = newCategoryName.charAt(0).toUpperCase() + newCategoryName.slice(1).trim();
        
        const response = await fetch('http://127.0.0.1:5000/categories', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ name: categoryName })
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const apiResponse = await response.json();
        
        const newCategory = {
          id: apiResponse.id || apiResponse.category?.id || Date.now(),
          name: apiResponse.name || apiResponse.category?.name || categoryName,
          created_at: apiResponse.created_at || apiResponse.category?.created_at || new Date().toISOString(),
          creator_id: apiResponse.creator_id || apiResponse.category?.creator_id || 1
        };
        
        setCategories(prevCategories => [...prevCategories, newCategory]);
        setFormData(prevFormData => ({
          ...prevFormData, 
          category: { name: newCategory.name, id: newCategory.id }
        }));

        if (hasSubmitted && errors.category) {
          setErrors(prev => ({ ...prev, category: '' }));
        }
        
        setNewCategoryName('');
        setShowAddCategory(false);
        setShowCategoryDropdown(false);
        
      } catch (error) {
        console.error('Failed to add category:', error);
        alert(`Failed to add category: ${error.message}`);
      } finally {
        setIsAddingCategory(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (hasSubmitted && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links];
    
    // If it's a URL field, auto-format it
    if (field === 'url' && value.trim()) {
      // Check if URL already has protocol
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        // Add https:// if it looks like a URL (contains a dot)
        if (value.includes('.')) {
          value = 'https://' + value;
        }
      }
    }
    
    newLinks[index] = {
      ...newLinks[index],
      [field]: value
    };
    setLinks(newLinks);
  };

  const addLink = () => {
    setLinks([...links, { title: '', url: '' }]);
  };

  const removeLink = (index) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const handleDeleteContact = async () => {
    setIsDeleting(true);
    try {
      if(!accessToken) {
        throw new Error("AccessToken is not valid")
      }

      const deleteMessage = await deleteContactById(accessToken, formData.id);
      navigate('/myspace/contacts', { replace: true });
    } catch (error) {
      console.error('Error deleting contact:', error);
      setErrors(prev => ({ ...prev, submit: `Failed to delete contact: ${error.message}` }));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleFavoriteToggle = async () => {
      const newFavoriteState = !formData.isFavorite;

      try {
          setFormData(prev => ({...prev, isFavorite: newFavoriteState}));
          
          if (!accessToken) {
              throw new Error("Access token is not available.");
          }

          // Send ONLY the favorite status - minimal payload!
          const minimalUpdateData = {
              is_favorite: newFavoriteState
          };

          console.log("Minimal data sent to API:", minimalUpdateData);
          const apiResponse = await updateContact(accessToken, formData.id, minimalUpdateData);
          
          if (!apiResponse) {
              throw new Error('Failed to update favorite status');
          }

          // Update contact data to match
          setContactData(prev => ({ ...prev, isFavorite: newFavoriteState }));
          
      } catch (error) {
          console.error('Error updating favorite status:', error);
          // Revert the UI change if API call failed
          setFormData(prev => ({ ...prev, isFavorite: !newFavoriteState }));
          setError(`Failed to update favorite status: ${error.message}`);
      }
  };

  const validateForm = () => {
    const newErrors = {};       
    
    // First name validation
    if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (formData.lastName && formData.lastName.trim() && formData.lastName.trim().length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // category validation
    if (!formData.category || !formData.category.name || !formData.category.id) {
        newErrors.category = 'Category is required';
    }
    
    // Email validation
    if (!formData.email) {
        newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && formData.phone.trim() && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate birthdate (must be in the past)
    if (formData.birthdate && formData.birthdate.trim()) {
        const birthdateError = validateDate(formData.birthdate, 'Birthdate', true);
        if (birthdateError) {
            newErrors.birthdate = birthdateError;
        }
    }

    // Validate contactDate (format only, doesn't need to be in past)
    if (formData.contactDate && formData.contactDate.trim()) {
        const contactDateError = validateDate(formData.contactDate, 'Contact date', false);
        if (contactDateError) {
            newErrors.contactDate = contactDateError;
        }
    }

    // Validate links - URL must have a title
    if (showLinks && links) {
        links.forEach((link, index) => {
            const hasUrl = link.url && link.url.trim();
            const hasTitle = link.title && link.title.trim();
            
            if (hasUrl && !hasTitle) {
                newErrors[`link_${index}`] = 'title for url required.';
            }
        });
    }
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    if (!formData) return;
    setIsEditing(true);
    setHasSubmitted(false);
    setErrors({});
  };

  const handleGoBack = () => {
  navigate(-1);
  };


  const handleSave = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);

    try {
      if (!accessToken) {
        throw new Error("Access token is not available.");
      }

      const updatedContactData = FormDataToApiData(formData, categories, links);

      const apiResponse = await updateContact(accessToken, formData.id, updatedContactData);
    
      if (!apiResponse) {
        throw new Error('Failed to update contact - no response from server');
      }
      
      const updatedFormData = ApiDataToFormData(apiResponse);
      setFormData(updatedFormData);
      setContactData(updatedFormData);
      
      setIsEditing(false);
      setHasSubmitted(false);
      setErrors({});
      
    } catch (error) {
      console.error('Error updating contact:', error);
      setError(`Failed to update contact: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!formData) return;

    const originalFormData = ApiDataToFormData(contactData);
    setFormData(originalFormData);

    setIsEditing(false);
    setHasSubmitted(false);
    setErrors({});
    
    // Reset UI states based on original data
    setShowBirthdate(!!originalFormData.birthdate);
    setShowAddress(
      !!(originalFormData.streetAndNr || originalFormData.city || 
        originalFormData.country || originalFormData.postalcode)
    );
    setShowContactDetails(
      !!(originalFormData.contactDate || originalFormData.meetingPlace)
    );
    
    const hasLinks = originalFormData.links && originalFormData.links.length > 0;
    setShowLinks(hasLinks);
    setLinks(hasLinks ? originalFormData.links : [{ title: '', url: '' }]);
  
  };


  

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.log("Error: Error Page Showing")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 tracking-wider mb-4">{error}</p>
          <button 
            onClick={() => navigate('/myspace/contacts')}
            className="bg-red-500 text-white tracking-wider px-4 py-2 rounded-full hover:bg-black"
          >
            Back to contacts.
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!contactData || !formData) {
    console.log("No Data found: No Contact Found Page Showing")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-black tracking-wider text-lg font-light mb-4">Sorry! Your contact cannot be found.</p>
          <button 
            onClick={handleGoBack}
            className="bg-red-500 text-white tracking-wide px-4 py-2 rounded-full hover:bg-black"
          >
            go back.
          </button>
        </div>
      </div>
    );
  }

  // Editing Mode
  if (isEditing) {
    console.log("Edit Mode Showing")
    return (
      <form onSubmit={handleSave}>
        <div className="w-full flex flex-col items-center min-h-screen bg-white dark:bg-black" 
            style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Edit Contact Card */}
            <div className="bg-white rounded-3xl p-5 mt-10 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] mx-auto"
                style={{ 
                    boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
                }}>
                <h1 className="text-3xl font-bold text-center mb-10 mt-6 text-black">
                    edit <span className= "text-red-500"> {formData.firstName}.</span>
                </h1>

                {/* Favorite Checkbox */}
                <div className="flex items-center w-full relative left-1 mt-3 mb-8 rounded-lg">
                    <button
                        type="button"
                        onClick={handleFavoriteToggle} 
                        className="flex items-center space-x-2  hover:scale-110 transform"
                        disabled={isLoading}
                    >
                        <svg 
                            className={`w-7 h-7 ${
                                formData.isFavorite ? 'text-red-500 hover:text-yellow-300' : 'text-black hover:text-yellow-300'
                            }`} 
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"  
                            viewBox="0 0 22 20"
                        >
                            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                        </svg>
                        <span className="text-sm font-light text-black cursor-pointer">
                            {formData.isFavorite ? 'favorite contact' : 'not a favorite'}
                        </span>
                    </button>
                </div>

                {/* Main Contact Information */}
                <div className="space-y-7 mb-8">
                    {/* First Name Field */}
                    <div className="relative">
                        <input 
                            type="text" 
                            name="firstName" 
                            id="firstName" 
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="meryl"
                            disabled={isSaving}
                            className={`w-full rounded-xl border bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.firstName ? 'border-red-500 shadow-lg' : 'border-gray-400 dark:border-gray-400'
                            }`}
                            style={{
                                fontSize: '18px',
                                fontWeight: 300
                            }}
                        />
                        <label 
                            htmlFor="firstName" 
                            className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-light"
                        >
                            first name
                        </label>
                        {hasSubmitted && errors.firstName && (
                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.firstName}</p>
                        )}
                    </div>

                    {/* Last Name Field */}
                    <div className="relative">
                        <input 
                            type="text" 
                            name="lastName" 
                            id="lastName" 
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="streep"
                            disabled={isSaving}
                            className={`w-full rounded-xl border bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.lastName ? 'border-red-500 shadow-lg' : 'border-gray-400 dark:border-gray-400'
                            }`}
                            style={{
                                fontSize: '18px',
                                fontWeight: 300
                            }}
                        />
                        <label 
                            htmlFor="lastName" 
                            className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-light"
                        >
                            last name
                        </label>
                        {hasSubmitted && errors.lastName && (
                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.lastName}</p>
                        )}
                    </div>

                    {/* Category Field */}
                    <div className="relative">
                        <label className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-light">
                            category
                        </label>
                        
                        {/* Custom Dropdown Button */}
                        <button
                            type="button"
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            disabled={isSaving}
                            className={`w-full p-2.5 rounded-xl border bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black placeholder-gray-200 font-light max-w-full min-w-[200px] focus:outline-none focus:border-red-500 flex items-center justify-between ${
                                hasSubmitted && errors.category ? 'border-red-500 shadow-lg' : 'border-gray-400 dark:border-gray-400'
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 300
                            }}
                        >
                            <span className={formData.category?.name ? 'text-black' : 'text-gray-300'}>
                              {formData.category?.name || 'select category'}
                            </span>
                            <svg 
                                className={`w-4 h-4 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Custom Dropdown Menu */}
                        {showCategoryDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ 
                                              ...prev, 
                                              category: { name: category.name, id: category.id }
                                            }));
                                            
                                            // Clear error immediately (same as handleInputChange does)
                                            if (hasSubmitted && errors.category) {
                                                setErrors(prev => ({ ...prev, category: '' }));
                                            }
                                            setShowCategoryDropdown(false);
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-50 hover:text-red-500 text-black font-light"
                                        style={{ fontSize: '16px', fontWeight: 300 }}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                                
                                <div className="border-t border-gray-100"></div>
                                
                                {!showAddCategory ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddCategory(true)}
                                        className="w-full text-left px-3 py-2 hover:bg-red-50 transition-colors duration-150 text-red-500 font-light flex items-center space-x-2"
                                        style={{ fontSize: '16px', fontWeight: 300 }}
                                    >
                                        <span className="text-lg font-semibold">+</span>
                                        <span>add new category</span>
                                    </button>
                                ) : (
                                    <div className="p-3 space-y-2">
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="enter category name"
                                            className="w-full p-2 rounded-lg border border-gray-300 bg-transparent text-black font-light placeholder-gray-300 focus:outline-none focus:border-red-500"
                                            style={{ fontSize: '15px', fontWeight: 300 }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    addCategory();
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={addCategory}
                                                disabled={isAddingCategory || !newCategoryName.trim()}
                                                className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-sm font-light"
                                            >
                                                {isAddingCategory ? 'adding...' : 'add'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddCategory(false);
                                                    setNewCategoryName('');
                                                }}
                                                disabled={isAddingCategory}
                                                className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150 text-sm font-light"
                                            >
                                                cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Click outside to close dropdown */}
                        {showCategoryDropdown && (
                            <div 
                                className="fixed inset-0 z-20" 
                                onClick={() => {
                                    setShowCategoryDropdown(false);
                                    setShowAddCategory(false);
                                    setNewCategoryName('');
                                }}
                            />
                        )}

                        {hasSubmitted && errors.category && (
                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.category}</p>
                        )}
                    </div>

                    {/* How to contact */}
                    <div className="space-y-2 mb-8">
                        {/* Email Field */}
                        <div className="relative">
                            <p className="relative text-red-500 left-2 -mb-3 font-light">how to contact?</p>
                            <label 
                                htmlFor="email" 
                                className="relative top-3 left-4 bg-white px-1 text-base text-black font-light"
                            >
                                email
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your@email.com"
                                disabled={isSaving}
                                className={`w-full rounded-xl border bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                    hasSubmitted && errors.email ? 'border-red-500 shadow-lg' : 'border-gray-400 dark:border-gray-400'
                                }`}
                                style={{
                                    fontSize: '18px',
                                    fontWeight: 300
                                }}
                            />
                            {hasSubmitted && errors.email && (
                                <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div className="relative">
                            <label htmlFor="phone" className="relative top-3 left-4 bg-white px-1 text-base text-black font-light">
                                phone
                            </label>
                            <input 
                                type="tel" 
                                name="phone" 
                                id="phone" 
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+49 1781234567"
                                disabled={isSaving}
                                className={`w-full rounded-xl border bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                    hasSubmitted && errors.phone ? 'border-red-500 shadow-lg' : 'border-gray-400 dark:border-gray-400'
                                }`}
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 300
                                }}
                            />
                            {hasSubmitted && errors.phone && (
                                <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.phone}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Optional sections - Similar structure as your original form */}
                <div className="space-y-4 mb-8">
                    {/* Birthdate Toggle and Field */}
                    <div className="space-y-2">
                        <div className="relative">
                            {!showBirthdate ? (
                                <button
                                    type="button"
                                    onClick={() => setShowBirthdate(true)}
                                    className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-light"
                                    disabled={isSaving}
                                >
                                    <span className="text-lg font-semibold">+</span>
                                    <span className="text-base text-black hover:text-red-500">date of birth</span>
                                </button>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="birthdate" className="block relative top-3 left-4 bg-white px-1 text-sans text-black font-light">
                                            date of birth
                                        </label>
                                        <span className="relative right-1 font-light">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowBirthdate(false);
                                                    setFormData(prev => ({ ...prev, birthdate: '' }));
                                                }}
                                                className="text-red-500 hover:text-red-700 transition-colors duration-200 text-sm"
                                                disabled={isSaving}
                                            >
                                                remove
                                            </button>
                                        </span>
                                    </div>
                                    <input 
                                        type="text" 
                                        name="birthdate" 
                                        id="birthdate" 
                                        value={formData.birthdate}
                                        onChange={handleInputChange}
                                        placeholder="19.05.1998"
                                        disabled={isSaving}
                                        className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: 300
                                        }}
                                    />
                                    {hasSubmitted && errors.birthdate && (
                                        <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.birthdate}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Address Toggle and Fields */}
                        <div className="relative">
                            {!showAddress ? (
                                <button
                                    type="button"
                                    onClick={() => setShowAddress(true)}
                                    className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-light"
                                    disabled={isLoading}
                                >
                                    <span className="text-lg font-semibold">+</span>
                                    <span className="text-base text-black hover:text-red-500">add address</span>
                                </button>
                            ) : (
                                <div className="space-y-1 mt-7">
                                    <div className="flex items-center justify-between">
                                        <span className="relative left-2 mb-2 text-sans text-base text-black font-md">
                                            address information
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddress(false);
                                                setFormData(prev => ({ 
                                                    ...prev, 
                                                    streetAndNr: '', 
                                                    postalcode: '', 
                                                    city: '', 
                                                    country: '' 
                                                }));
                                            }}
                                            className="relative right-1 text-red-500 hover:text-red-700 transition-colors duration-200 text-sm font-light"
                                            disabled={isLoading}
                                        >
                                            remove
                                        </button>
                                    </div>
                                    
                                    {/* Address Field */}
                                    <div className="relative">
                                        <label htmlFor="streetAndNr" className="absolute -top-3 left-4 bg-white px-1 text-sans text-base text-black font-light">
                                            street & nr°
                                        </label>
                                        <input 
                                            type="text" 
                                            name="streetAndNr" 
                                            id="streetAndNr" 
                                            value={formData.streetAndNr}
                                            onChange={handleInputChange}
                                            placeholder="greifwalder Str. 8"
                                            disabled={isLoading}
                                            className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                            style={{
                                                fontSize: '18px',
                                                fontWeight: 300
                                            }}
                                        />
                                        {hasSubmitted && errors.streetAndNr && (
                                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.streetAndNr}</p>
                                        )}
                                    </div>

                                    {/* Postal Code and City in a row */}
                                    <div className="flex space-x-4">
                                        <div className="relative flex-1">
                                            <label htmlFor="postalcode" className="relative top-3 bg-white px-1 left-4 text-sans text-base text-black font-light">
                                                postal code
                                            </label>
                                            <input 
                                                type="text" 
                                                name="postalcode" 
                                                id="postalcode" 
                                                value={formData.postalcode}
                                                onChange={handleInputChange}
                                                placeholder="10407"
                                                disabled={isLoading}
                                                className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[120px] h-[48px] focus:outline-none focus:border-red-500`}
                                                style={{
                                                    fontSize: '16px',
                                                    fontWeight: 300
                                                }}
                                            />
                                            {hasSubmitted && errors.postalcode && (
                                                <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.postalcode}</p>
                                            )}
                                        </div>

                                        <div className="relative flex-1">
                                            <label htmlFor="city" className="relative top-3 bg-white px-1 left-4 text-sans text-base text-black font-light">
                                                city
                                            </label>
                                            <input 
                                                type="text" 
                                                name="city" 
                                                id="city" 
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                placeholder="berlin"
                                                disabled={isLoading}
                                                className={`flex p-2.5 w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[80px] h-[48px] focus:outline-none focus:border-red-500`}
                                                // flex p-2.5 w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[120px] h-[48px] focus:outline-none focus:border-red-500"
                                                style={{
                                                    fontSize: '16px',
                                                    fontWeight: 300
                                                }}
                                            />
                                            {hasSubmitted && errors.city && (
                                                <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.city}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Country Field */}
                                    <div className="relative">
                                        <label htmlFor="country" className="relative top-3 bg-white px-1 left-4 text-sans text-base text-black font-light">
                                            country
                                        </label>
                                        <input 
                                            type="text" 
                                            name="country" 
                                            id="country" 
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            placeholder="germany"
                                            disabled={isLoading}
                                            className={`w-full rounded-xl mb-5 border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: 300
                                            }}
                                        />
                                        {hasSubmitted && errors.country && (
                                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.country}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-3.5 mb-8">   
                    <div className="relative">
                        <p className="relative text-red-500 left-2 -mb-3 mt-5 font-light">notes?</p>
                        <div className="flex items-center justify-between">
                            <label htmlFor="notes" className="relative top-3 bg-white px-1 left-4 text-sans text-base text-black font-normal">
                                any important things to remember?
                            </label>
                        </div>
                        <textarea 
                            name="notes" 
                            id="notes" 
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="every thought matters.."
                            disabled={isSaving}
                            rows={6}
                            className={`w-full rounded-xl mb-4 pt-5 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] focus:outline-none focus:border-red-500`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 300,
                                height: 'auto'
                            }}
                        />
                    </div>
                </div>

                {/* Optional Toggle Field */}
                <div className="space-y-2 mb-8 -mt-5">
                    {/* Contact Details Toggle and Fields */}
                    <div className="relative">
                        {!showContactDetails ? (
                          <button
                              type="button"
                              onClick={() => setShowContactDetails(true)}
                              className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-light"
                              disabled={isLoading}
                          >
                              <span className="text-lg font-semibold">+</span>
                              <span className="text-base text-black hover:text-red-500">when and where did you meet? </span>
                          </button>
                      ) : (
                          <div className="space-y-2">
                              <div className="flex items-center justify-between -mb-4">
                                  <span className="relative left-2 text-sans text-red-500 font-light">do you remember...</span>
                                  <button
                                      type="button"
                                      onClick={() => {
                                          setShowContactDetails(false);
                                          setFormData(prev => ({ 
                                              ...prev, 
                                              ContactDate: '', 
                                              meetingPlace: '' 
                                          }));
                                      }}
                                      className="relative right-1 font-light text-red-500 hover:text-red-700 transition-colors duration-200 text-sm"
                                      disabled={isLoading}
                                  >
                                      remove
                                  </button>
                              </div>
                                  
                              {/* Last Contact Date Field */}
                              <div className="relative">
                                  <label htmlFor="contactDate" className="relative top-3 left-4 bg-white px-1 text-sans text-base text-black font-light">
                                      the date of your last contact?
                                  </label>
                                  <input 
                                      type="text" 
                                      name="contactDate" 
                                      id="contactDate" 
                                      value={formData.contactDate}
                                      onChange={handleInputChange}
                                      disabled={isLoading}
                                      className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                      style={{
                                          fontSize: '16px',
                                          fontWeight: 300
                                      }}
                                  />
                                  {hasSubmitted && errors.contactDate && (
                                      <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.contactDate}</p>
                                  )}
                              </div>

                              {/* Meeting Place Field */}
                              <div className="relative">
                                  <label htmlFor="meetingPlace" className="relative top-3 left-4 bg-white px-1 text-sans text-base text-black font-light">
                                      the place where you met?
                                  </label>
                                  <input 
                                      type="text" 
                                      name="meetingPlace" 
                                      id="meetingPlace" 
                                      value={formData.meetingPlace}
                                      onChange={handleInputChange}
                                      placeholder="coffe shop, berlin ..."
                                      disabled={isLoading}
                                      className={`w-full mb-5 rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                      style={{
                                          fontSize: '16px',
                                          fontWeight: 300
                                      }}
                                  />
                                  {hasSubmitted && errors.meetingPlace && (
                                      <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.meetingPlace}</p>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
                </div>

                {/* Optional Links */}
                <div className="space-y-3">
                        <div className="relative">
                            {!showLinks ? (
                                <button
                                    type="button"
                                    onClick={() => setShowLinks(true)}
                                    className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-light"
                                    disabled={isSaving}
                                >
                                    <span className="text-lg font-semibold">+</span>
                                    <span className="text-base text-black hover:text-red-500">add weblinks</span>
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="relative left-2 text-sans text-base text-black font-light">
                                            websites & links
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowLinks(false);
                                                setLinks([{ title: '', url: '' }]);
                                            }}
                                            className="text-red-500 hover:text-red-700 transition-colors duration-200 text-sm"
                                            disabled={isSaving}
                                        >
                                            remove
                                        </button>
                                    </div>
                                    
                                    {links.map((link, index) => (
                                        <div key={index} className="relative flex items-center space-x-2">
                                            <input 
                                                type="text" 
                                                value={link.title}
                                                onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                                                placeholder="website"
                                                disabled={isSaving}
                                                className="flex relative p-2.5 w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 min-w-[100px] max-w-[120px] h-[48px] focus:outline-none focus:border-red-500"
                                                style={{
                                                    fontSize: '16px',
                                                    fontWeight: 300
                                                }}
                                            />
                                            <input 
                                                type="text" 
                                                value={link.url}
                                                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                                placeholder="www.google.com or https://example.com"
                                                disabled={isSaving}
                                                className="flex p-2.5 w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[120px] h-[48px] focus:outline-none focus:border-red-500"
                                                style={{
                                                    fontSize: '16px',
                                                    fontWeight: 300
                                                }}
                                            />
                                            {links.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLink(index)}
                                                    className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1"
                                                    disabled={isSaving}
                                                >
                                                    ×
                                                </button>  
                                            )}
                                            {hasSubmitted && errors[`link_${index}`] && (
                                                <p className="absolute top-full right-8 text-sm text-red-600 z-20">{errors[`link_${index}`]}</p>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <button
                                        type="button"
                                        onClick={addLink}
                                        className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-light text-sm"
                                        disabled={isSaving}
                                    >
                                        <span className="text-base">+</span>
                                        <span className="text-black hover:text-red-500">add another link</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                {/* Save and Cancel Buttons */}
                
                
                {/* Deleting Button with Confirmation */}
                <CircleButton
                    type="button"
                    size="medium"
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="absolute -bottom-[74px] right-[100px] text-xl font-light hover:bg-red-700"
                    style={{ 
                      marginTop: '2rem', 
                      marginRight: 'auto', 
                      display: 'block',
                    }}
                    disabled={isSaving || isDeleting}
                  >
                    delete.
                  </CircleButton>
                  
                  <div className="flex space-x-4 items-center justify-center mt-8 ml-auto">
                    <CircleButton
                        size="xl"
                        variant="dark"
                        type="submit"
                        onClick={handleSave}
                        className=" absolute -bottom-[85px] -right-[10px] text-2xl font-semibold"
                            style={{ 
                                marginTop: '2rem', 
                                marginLeft: 'auto', 
                                display: 'block' 
                            }}
                        disabled={isSaving}
                    >
                        {isSaving ? 'saving...' : 'save.'}
                    </CircleButton>
                </div>

                  {/* Delete Confirmation Modal */}
                  {showDeleteConfirmation && (
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
                          delete <span className="text-red-500">{formData.firstName}?</span>
                        </h2>
                        
                        {/* Message */}
                        <p className="text-center text-black tracking-wider font-light mb-8 leading-relaxed">
                          this action cannot be undone. all contact information, notes, and history will be permanently removed.
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                          {/* Cancel Button */}
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirmation(false)}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 text-black tracking-wide font-md hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontSize: '16px' }}
                          >
                            cancel.
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={handleDeleteContact}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-6 rounded-xl bg-red-500 text-white font-md tracking-wide hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                              'delete forever.'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

            </div>

            {/* Back Link */}
            <div className="text-black dark:text-white font-light block mt-2 relative -ml-48 mb-36"
                style={{ fontSize: '16px' }}>
                want to cancel? {' '}
                <button 
                    onClick={handleCancel}
                    className="font-normal text-red-500 hover:underline bg-transparent border-none cursor-pointer"
                    disabled={isSaving}
                >
                    go back.
                </button>
            </div>
        </div>
      </form>
    );
  }



  // VIEW MODE
  console.log("Contact Mode Showing")
  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-white dark:bg-black" 
        style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
      
      {/* Main Contact Display Card */}
      <div className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] h-fit mx-auto mt-10 "
          style={{ 
              boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
          }}>
        
        {/* Header with Name and Favorite */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-10 mb-3 mt-8">
            <h1 className="text-3xl ml-14 font-bold text-black">
              {formData.firstName} {formData.lastName}
            </h1>
          
            {/* Favorite Checkbox */}
            <div className="flex items-center pr-2">
                <button
                        type="button"
                        onClick={handleFavoriteToggle} 
                        className="flex items-center hover:scale-110 transform"
                        disabled={isLoading}
                    >
                    <svg 
                        className={`w-7 h-7 ${
                            formData.isFavorite ? 'text-red-500 hover:text-yellow-300' : 'text-black hover:text-yellow-300'
                        }`} 
                        aria-hidden="true" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="currentColor" 
                        viewBox="0 0 22 20"
                        >
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                    </svg>
                </button>
            </div>
          </div>
          
          
          {/* Category Badge */}
          <span className="inline-block px-4 py-2 bg-red-100 text-red-600 rounded-full text-base -mt-1 mb-2 font-light">
            {typeof formData.category === 'string' ? formData.category : formData.category?.name}
          </span>
        </div>


        {/* Contact Information */}
        <div className="space-y-6 mb-8">
          {/* Contact Methods */}
          <div className="space-y-2">
            <h3 className="text-red-500 font-light text-sm ml-3 -mb-4">how to contact?</h3>
            
            {/* Email */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-black font-light text-sm">email</div>
              <a 
                href={`mailto:${formData.email}`}
                className="text-black text-normal font-light hover:text-red-500 transition-colors"
              >
                {formData.email}
              </a>
            </div>
            
            {/* Phone */}
            {formData.phone && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-black font-light text-sm">phone</div>
                <a 
                  href={`tel:${formData.phone}`}
                  className="text-black text-normal font-light hover:text-red-500 transition-colors"
                >
                  {formData.phone}
                </a>
              </div>
            )}
          </div>

          {/* Birthday */}
          {formData.birthdate && (
            <div className="space-y-2">
              <h3 className="text-red-500 font-light text-sm ml-3 -mb-4">date of birth</h3>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-black text-normal font-light">
                  {formData.birthdate}
                </div>
              </div>
            </div>
          )}

          {/* Address */}
          {(formData.streetAndNr || formData.city || formData.country) && (
            <div className="space-y-2">
              <h3 className="text-red-500 font-light text-sm ml-3 -mb-4">address</h3>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-black text-normal font-light -space-y-1">
                  {formData.streetAndNr && <div>{formData.streetAndNr},</div>}
                  <div>
                    {formData.postalcode && `${formData.postalcode} `}
                    {formData.city},
                  </div>
                  {formData.country && <div>{formData.country}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {formData.notes && (
            <div className="space-y-2">
              <h3 className="text-red-500 font-light text-sm ml-3 -mb-4">notes</h3>
              <div className="bg-gray-50 rounded-xl p-3 ">
                <div className="text-black text-normal font-light whitespace-pre-wrap ">
                  {formData.notes}
                </div>
              </div>
            </div>
          )}

          {/* Contact History */}
          {(formData.contactDate || formData.meetingPlace) && (
            <div className="space-y-2">
              <h3 className="text-red-500 font-light text-sm ml-3 -mb-4">contact history</h3>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                {formData.contactDate && (
                  <div>
                    <span className="text-black font-light text-sm">date:</span>
                    <span className="text-black text-normal font-light ml-5">
                      {formData.contactDate}
                    </span>
                  </div>
                )}
                {formData.meetingPlace && (
                  <div>
                    <span className="text-black font-light text-sm">place:</span>
                    <span className="text-black text-normal font-light ml-4">
                      {formData.meetingPlace}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Links */}
          {formData.links && formData.links.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-red-500 font-light text-sm ml-3 -mb-4">links</h3>
              <div className="space-y-2">
                {formData.links.map((link, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-3 hover:text-red-500">
                    <a 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black text-normal font-light hover:text-red-500 transition-colors break-all"
                    >
                      {link.title}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <CircleButton
            size="xl"
            variant="dark"
          onClick={handleEdit}
          className="absolute -bottom-[85px] -right-[10px] font-semibold"
          style={{ 
            marginTop: '2rem', 
            marginLeft: 'auto', 
            display: 'block' 
          }}
          disabled={isLoading}
        >
          edit.
        </CircleButton>
      </div>

      {/* Back Links */}
      <div className="w-full px-8 pt-1 space-y-0.25 max-w-[480px] pb-28">
        <div className="text-black dark:text-white font-light block relative"
            style={{ fontSize: '16px' }}>
          want to go {' '}
          <button 
            onClick={() => navigate('/myspace/contacts')}
            className="font-normal text-red-500 hover:underline bg-transparent border-none cursor-pointer"
          >
          to contacts?
          </button>
        </div>
        <div className="text-black dark:text-white font-light block -mt-2 relative"
            style={{ fontSize: '16px' }}>
          or go {' '}
          <button 
            onClick={handleGoBack}
            className="font-normal text-red-500 hover:underline bg-transparent border-none cursor-pointer"
          >
          back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowContactForm;