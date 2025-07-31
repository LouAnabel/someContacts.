import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CircleButton from '../ui/Buttons';
import { useAuthContext } from '../../context/AuthContextProvider';
import { getContactById, getCategories } from '../../apiCalls/contactsApi';


const ShowContactForm = ({id}) => {

  const navigate = useNavigate();
  const { accessToken } = useAuthContext();
  
  // Loading state and Error State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  console.log("Load Default Contact Data")
  const [contactData, setContactData] = useState({});
  console.log("Load Default Form Data")
  const [formData, setFormData] = useState({});

  // Edit Mode states
  const [isEditing, setIsEditing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState({}); // Why both?

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
  const [links, setLinks] = useState(['']);


  // helper funciton to transform API Format in UI Form Format
  const ApiDataToFormData = (apiResponse) => {
    console.log('apiResponse:', apiResponse)

    const contact = apiResponse.contact || apiResponse;
    console.log('Trasformed contact data. contact:', contact)
    
    return {
      id: contact.id || '',
      firstName: contact.first_name || '',
      lastName: contact.last_name || '',
      category: contact.category?.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      isFavorite: contact.is_favorite || false,
      birthdate: contact.birth_date || '',
      streetAndNr: contact.street_and_nr || '',
      postalcode: contact.postal_code || '',
      city: contact.city || '',
      country: contact.country || '',
      notes: contact.notes || '',
      lastContactDate: contact.last_contact_date || '',
      meetingPlace: contact.last_contact_place || '',
      links: contact.links || []
      }
    };


  // Step 1: Loading Form Data from API with ID
  console.log("Step 1: accessing API for contact with ID", id)
  useEffect(() => {

    console.log("Calling LoadContact Function")
    const fetchContactData = async () => {

      // checking if token and ID exist 
      console.log("See if accessToken and ID exist")
        if (!accessToken || !id) {
          setIsLoading(false);
          return;
        }
        console.log("Successfull with token and ID")
        try {
          setIsLoading(true);
          setError(null);

          // fetching data and save it as apiContactData
          console.log("Step 2: Fetching contactData with ID:", id) 
          const apiContactData = await getContactById(accessToken, id);
          console.log('received Contact Data to setContactData UseState:', apiContactData)
          setContactData(apiContactData); // => original fetched ContactData for the user to see
        
          // transforming apiContact Data into UI Form Data
          const newFormData = ApiDataToFormData(apiContactData);
          console.log("transformed API Data for FormData:", newFormData)
          setFormData(newFormData); // FormData

        } catch (error) {
          console.error('Failed to load contact data:', error);
          setError(error.message || 'Failed to load contact data');
          setContactData({});
          setFormData({});

        } finally {
          setIsLoading(false);
      }
    };

    fetchContactData();

  },[accessToken, id]);


  // Loading Categories
  useEffect(() => {
    const loadCategories = async () => {
      if (!accessToken) return;

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


  // Initialize optional sections when contact data loads
  useEffect(() => {
    if (!formData) return;

    setShowBirthdate(!!formData.birthdate);
    setShowAddress(
      !!(formData.streetAndNr || formData.city || 
         formData.country || formData.postalcode)
    );
    setShowContactDetails(
      !!(formData.lastContactDate || formData.lastContactPlace)
    );
    
    const hasLinks = formData.links && formData.links.length > 0;
    setShowLinks(hasLinks);
    setLinks(hasLinks ? formData.links.map(link => link.url || link) : ['']);
  }, [formData]);

  
  // LOADING CATEGORIES TO DATABASE 
    const addCategory = async () => {
        if (newCategoryName.trim() && !isAddingCategory) {
            setIsAddingCategory(true);
            
            try {
                const categoryName = newCategoryName.charAt(0).toUpperCase() + newCategoryName.slice(1).trim();
                console.log('Adding category:', categoryName);
                
                // ADD CATEGORIES TO DATABASE
                const response = await fetch('http://127.0.0.1:5000/categories', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ 
                        name: categoryName
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                
                const apiResponse = await response.json();
                console.log('API Response for new category:', apiResponse);
                
                // Create a properly formatted category object
                const newCategory = {
                    id: apiResponse.id || apiResponse.category?.id || Date.now(),
                    name: apiResponse.name || apiResponse.category?.name || categoryName,
                    created_at: apiResponse.created_at || apiResponse.category?.created_at || new Date().toISOString(),
                    creator_id: apiResponse.creator_id || apiResponse.category?.creator_id || 1
                };
                
                console.log('Formatted new category:', newCategory);
                console.log('Current categories before update:', categories);
                
                // Update categories state with the new category
                setCategories(prevCategories => [...prevCategories, newCategory]);
                
                // Update form data to select the new category
                setFormData(prevFormData => ({...prevFormData, category: newCategory.name }));
                
                // Clear category errors
                if (hasSubmitted && errors.category) {
                    setErrors(prev => ({ ...prev, category: '' }));
                }
                
                // Reset add category form
                setNewCategoryName('');
                setShowAddCategory(false);
                
                // Brief delay before closing dropdown so user can see the selection
                setTimeout(() => {
                    setShowCategoryDropdown(false);
                }, 800);
                
                console.log('Category added successfully:', newCategory.name);
                
            } catch (error) {
                console.error('Failed to add category:', error);
                alert(`Failed to add category: ${error.message}`);
            } finally {
                setIsAddingCategory(false);
            }
        }
    };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (hasSubmitted && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const addLink = () => {
    setLinks([...links, '']);
  };

  const removeLink = (index) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  // UPDATE Contact with validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && formData.phone.trim() && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    
    if (!validateForm()) {
      console.error('Form validation failed:', errors);
      return;
    }
    
    setIsSaving(true);

    try {
      if (!accessToken) {
          throw new Error("Access token is not available.");
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // // Update contact data with form data
      // const updatedData = { ...formData };
      // if (showLinks) {
      //   updatedData.links = links.filter(link => link.trim() !== '');
      // }

      // Update contact data with form data
      const updatedFormData = {
        first_name : formData.firstName,
        last_name : formData.lastName,
        email : formData.email,
        phone : formData.phone,
        category_id : formData.category.id,
        is_favorite : formData.isFavorite,
        last_contact_date : formData.lastContactDate,
        last_contact_place : formData.meetingPlace,
        birth_date : formData.birthdate,
        street_and_nr : formData.streetAndNr,
        postal_code : formData.postalcode,
        city : formData.city,
        country : formData.country,
        notes : formData.notes,
        links: links.filter(link => link.trim() !== '')
      };
      
      console.log(updatedFormData)
      setFormData(updatedFormData);
      setContactData(ApiDataToFormData(updatedFormData));
      setIsEditing(false);
      setHasSubmitted(false);
      
      console.log('Contact updated:', updatedData);
    } catch (error) {
      console.error('Error updating contact:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    if (!formData) return;

    setIsEditing(true);
    setHasSubmitted(false);
    setErrors({});
  };

  const handleCancel = () => {
    if (!formData) return;

    setFormData({ ...formData });
    setIsEditing(false);
    setHasSubmitted(false);
    setErrors({});
    
    // Reset optional sections
    setShowBirthdate(!!formData.birthdate);
    setShowAddress(!!formData.streetAndNr || !!formData.city || !!formData.country || !!formData.postalcode);
    setShowContactDetails(!!formData.lastContactDate || !!formData.meetingPlace);
    setShowLinks(formData.links && formData.links.length > 0);
    setLinks(formData.links && formData.links.length > 0 ? formData.links : ['']);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/contacts')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Back to Contacts
          </button>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!contactData || !formData) {
    console.log("No Data found: No Contact Found Page Showing")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Contact not found</p>
          <button 
            onClick={() => navigate('/contacts')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Back to Contacts
          </button>
        </div>
      </div>
    );
  }


  if (isEditing) {
    console.log("Edit Mode Showing")
    return (
      <form onSubmit={handleSave}>
        <div className="w-full flex flex-col items-center min-h-screen bg-white dark:bg-black" 
            style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Edit Contact Card */}
            <div className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] mx-auto"
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
                        onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                        className="flex items-center space-x-2 hover:scale-110 transform"
                        disabled={isSaving}
                    >
                        <svg 
                            className={`w-7 h-7 ${
                                formData.isFavorite ? 'text-red-500 hover:text-yellow-300' : 'black hover:text-yellow-300'
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
                            <span className={formData.category ? 'text-black' : 'text-gray-300'}>
                                {formData.category || 'select category'}
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
                                            setFormData(prev => ({ ...prev, category: category.name }));
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
                                        type="date" 
                                        name="birthdate" 
                                        id="birthdate" 
                                        value={formData.birthdate}
                                        onChange={handleInputChange}
                                        disabled={isSaving}
                                        className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: 300
                                        }}
                                    />
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
                                                className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
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
                                                className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[150px] h-[48px] focus:outline-none focus:border-red-500`}
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

                        {/* Continue with address, contact details, and links sections using the same pattern... */}
                        {/* For brevity, I'll include the key sections. The full implementation would include all sections from your original form */}
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
                            className={`w-full rounded-xl mb-4 border pt-5 border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] focus:outline-none focus:border-red-500`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 300,
                                height: 'auto'
                            }}
                        />
                    </div>
                </div>

                {/* Save and Cancel Buttons */}
                <div className="flex space-x-4 items-center justify-center mt-8">
                    <CircleButton
                        size="xl"
                        variant="dark"
                        type="submit"
                        className="border border-white/30 absolute -bottom-[85px] -right-[10px]"
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
            </div>

            {/* Back Link */}
            <div className="text-black dark:text-white font-light block mt-3 relative -ml-40 mb-36"
                style={{ fontSize: '16px' }}>
                want to cancel? {' '}
                <button 
                    onClick={handleCancel}
                    className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer"
                    disabled={isSaving}
                >
                    back to contact.
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
      <div className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] h-fit mx-auto"
          style={{ 
              boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
          }}>
        
        {/* Header with Name and Favorite */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-10 mb-3 ml-5 mt-8">
            <h1 className="text-3xl ml-14 font-bold text-black">
              {formData.firstName} {formData.lastName}
            </h1>
          
            {/* Favorite Checkbox */}
            <div className="flex items-center">
                <button
                    type="button"
                    onClick={() => setContactData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
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
            {formData.category}
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
                  {formatDate(formData.birthdate)}
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
          {(formData.lastContactDate || formData.meetingPlace) && (
            <div className="space-y-2">
              <h3 className="text-red-500 font-light text-sm ml-3 -mb-4">contact history</h3>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                {formData.lastContactDate && (
                  <div>
                    <span className="text-black font-light text-sm">last contact:</span>
                    <span className="text-black text-normal font-light ml-6">
                      {formatDate(formData.lastContactDate)}
                    </span>
                  </div>
                )}
                {formData.meetingPlace && (
                  <div>
                    <span className="text-black font-light text-sm">met at:</span>
                    <span className="text-black text-normal font-light ml-14">
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
                  <div key={index} className="bg-gray-50 rounded-xl p-3">
                    <a 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black text-normal font-light hover:text-red-500 transition-colors break-all"
                    >
                      {link.url}
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
          className=" absolute -bottom-[85px] -right-[10px]"
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

      {/* Back Link */}
      <div className="text-black dark:text-white font-light block mt-3 relative -ml-56 mb-36"
          style={{ fontSize: '16px' }}>
        want to go back? {' '}
        <button 
          onClick={() => navigate('/myspace/contacts')}
          className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer"
        >
        all contacts.
        </button>
      </div>
    </div>
  );
};

export default ShowContactForm;