
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContextProvider';
import { getContactById, getCategories, updateContact, deleteContactById } from '../../apiCalls/contactsApi';
import FormDataToApiData from '../helperFunctions/FormToApiData';
import ApiDataToFormData from '../helperFunctions/ApiToFormData';
import { validateDate } from '../helperFunctions/dateConversion';
import CircleButton from '../ui/Buttons';
import CategorySelection from '../ui/CategorySelection';


const Button = ({ children, onClick, className = "", ...props }) => {
  return (
    <button
      onClick={onClick}
      className={` text-black dark:text-white hover:text-red-500 dark:hover:text-red-500 transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

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
  const [expandedNotes, setExpandedNotes] = useState(false);
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

        // fetch and set contactData
        const apiContactData = await getContactById(accessToken, id);
        console.log('Contact data received from API:', apiContactData);
        setContactData(apiContactData); // -> contactData
        
        // transform API contactData to form format and set formData
        const newFormData = ApiDataToFormData(apiContactData);
        console.log('Form data transformed:', newFormData);
        setFormData(newFormData); // -> formData


        // Initialize optional sections with the NEW form data
        setShowBirthdate(!!newFormData.birthdate);
        setShowAddress(
          !!(newFormData.streetAndNr || newFormData.city || 
            newFormData.country || newFormData.postalcode)
        );
        setShowContactDetails(
          !!(newFormData.lastContactDate || newFormData.nextContactDate)
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
        console.log("categoriesData:", categoriesData)
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


  const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear errors if user has already submitted once
        if (hasSubmitted && errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (errors.submit) {
            setErrors(prev => ({ ...prev, submit: '' }));
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
              const newLinks = links.filter((_, i) => i !== index);
              setLinks(newLinks);
          }
      };
  
  const handleCategoryClick = (categoryId) => {
    navigate(`/myspace/categories?expand=${categoryId}`, { replace: true });
  };
      
  //  HELPER FUNCTION: Get next available category ID
  const getNextCategoryId = (categories) => {
    if (!categories || categories.length === 0) return 1;
  
    // Find the highest existing ID and add 1
    const maxId = Math.max(...categories.map(cat => parseInt(cat.id) || 0));
    return maxId + 1;
  };

  // CREATING CATEGORY FOR DISPLAY (ADDING WHEN CONTACT GETS CREATED)
  const addCategory = async () => {
    if (newCategoryName.trim() && !isAddingCategory) {
      setIsAddingCategory(true);
      
      try {
        const categoryName = newCategoryName.charAt(0).toUpperCase() + newCategoryName.slice(1).trim();
        // Get the next available ID
        const nextId = getNextCategoryId(categories);
        
        // Create category with predictable ID
        const newCategory = {
          id: nextId,
          name: categoryName,
          creator_id: null, // Will be set by backend
          contact_count: 0,
          isPersisted: false
        };
        
        // Add to local categories list
        setCategories(prevCategories => [...prevCategories, newCategory]);
        
        // Add to form data
        setFormData(prevFormData => ({
          ...prevFormData, 
          categories: [...prevFormData.categories, { name: newCategory.name, id: newCategory.id }]
        }));

        // Clear category errors
        if (hasSubmitted && errors.categories) {
          setErrors(prev => ({ ...prev, categories: '' }));
        }
        
        setNewCategoryName('');
        setShowAddCategory(false);
        setShowCategoryDropdown(false);
        
        console.log('Category added successfully to local categories:', newCategory);
        
      } catch (error) {
        console.error('Failed to add category:', error);
        alert(`Failed to add category: ${error.message}`);
      } finally {
        setIsAddingCategory(false);
      }
    }
  };


  const addCategoryToForm = (category) => {
      // Check if category is already selected
      const isAlreadySelected = formData.categories.some(cat => cat.id === category.id);
      if (isAlreadySelected) {
          return; // Don't add if already selected
      }

      // Check if we already have 3 categories
      if (formData.categories.length >= 3) {
          alert('Maximum 3 categories allowed');
          return;
      }

      // Add the category
      setFormData(prev => ({
          ...prev,
          categories: [...prev.categories, { name: category.name, id: category.id }]
      }));

      // Clear error immediately
      if (hasSubmitted && errors.categories) {
          setErrors(prev => ({ ...prev, categories: '' }));
      }
  };

  const removeCategoryFromForm = (categoryId) => {
      setFormData(prev => ({
          ...prev,
          categories: prev.categories.filter(cat => cat.id !== categoryId)
      }));
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
          setContactData(prev => ({ ...prev, is_favorite: newFavoriteState }));
          
      } catch (error) {
          console.error('Error updating favorite status:', error);
          // Revert the UI change if API call failed
          setFormData(prev => ({ ...prev, isFavorite: !newFavoriteState }));
          setError(`Failed to update favorite status: ${error.message}`);
      }
  };

    const handleIsContactedToggle = async () => {
      const newIsContactedState = !formData.isContacted;

      try {
        setFormData(prev => ({...prev, isContacted: newIsContactedState}));
        
        if (!accessToken) {
          throw new Error("Access token is not available.");
        }

        const minimalUpdateData = {
          is_contacted: newIsContactedState
        };

        console.log("Minimal data sent to API:", minimalUpdateData);
        const apiResponse = await updateContact(accessToken, formData.id, minimalUpdateData);
        
        if (!apiResponse) {
          throw new Error('Failed to update contacted status');
        }

        setContactData(prev => ({ ...prev, is_contacted: newIsContactedState }));
        
      } catch (error) {
        console.error('Error updating contacted status:', error);
        setFormData(prev => ({ ...prev, isContacted: !newIsContactedState }));
        setError(`Failed to update contacted status: ${error.message}`);
      }
    };


    const handleIsToContactToggle = async () => {
      const newIsToContactState = !formData.isToContact;

      try {
        setFormData(prev => ({...prev, isToContact: newIsToContactState}));
        
        if (!accessToken) {
          throw new Error("Access token is not available.");
        }

        const minimalUpdateData = {
          is_to_contact: newIsToContactState
        };

        console.log("Minimal data sent to API:", minimalUpdateData);
        const apiResponse = await updateContact(accessToken, formData.id, minimalUpdateData);
        
        if (!apiResponse) {
          throw new Error('Failed to update to contact status');
        }

        setContactData(prev => ({ ...prev, is_to_contact: newIsToContactState }));
        
      } catch (error) {
        console.error('Error updating to contact status:', error);
        setFormData(prev => ({ ...prev, isToContact: !newIsToContactState }));
        setError(`Failed to update to contact status: ${error.message}`);
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
    if (!formData.categories || !Array.isArray(formData.categories) || formData.categories.length === 0) {
        newErrors.categories = 'At least one category is required';
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
    console.log("📋 === STARTING SAVE PROCESS ===");
    console.log("📋 Initial formData:", formData);
    
    e.preventDefault();
    setHasSubmitted(true);
    
    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }
    
    setIsSaving(true);

    try {
      if (!accessToken) {
        throw new Error("Access token is not available.");
      }

      // STEP 1: Find categories that need to be persisted
      const newCategories = formData.categories.filter(formCat => {
        const categoryInState = categories.find(cat => cat.id === formCat.id);
        return categoryInState && categoryInState.isPersisted === false;
      });
      console.log("🆕 New categories to persist:", newCategories);
      
      const idMappings = new Map(); // oldId -> newId

      // STEP 2: Persist new categories
      for (const newCat of newCategories) {
        try {
          console.log("💾 Persisting category:", newCat.name, "with ID:", newCat.id);
       
          const response = await fetch('http://127.0.0.1:5000/categories', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ 
              name: newCat.name,
              id: newCat.id 
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Category API Error:', response.status, errorText);
            throw new Error(`Failed to persist category: ${response.status}`);
          }
          
          const apiResponse = await response.json();
          console.log("Category persisted successfully:", apiResponse);
          
          // If backend returns a different ID, update our local data
          const actualId = apiResponse.id || apiResponse.category?.id || newCat.id;
          if (actualId !== newCat.id) {
            console.log(`ID mismatch: expected ${newCat.id}, got ${actualId}`);
            idMappings.set(newCat.id, actualId);
          }
          
        } catch (error) {
          console.error('❌ Failed to persist category:', newCat.name, error);
          throw new Error(`Failed to save category "${newCat.name}": ${error.message}`);
        }
      }

      // STEP 3: Save the contact
      console.log("📤 === PREPARING CONTACT SAVE ===");

      // Create updated form data with correct IDs
      const updatedFormData = {
        ...formData,
        categories: formData.categories.map(cat => ({
          ...cat,
          id: idMappings.get(cat.id) || cat.id // Use mapped ID if available, otherwise original
        }))
      };
      console.log("Updated formData with correct IDs:", updatedFormData);


      const submittedContactData = FormDataToApiData(updatedFormData, categories, links);
      console.log("📤 === DATA BEING SENT TO API ===");
      console.log("📤 Complete submitted data:", submittedContactData);

      const apiContactData = await updateContact(accessToken, formData.id, submittedContactData);
      if (!apiContactData) {
        throw new Error('Failed to update contact - no response from server');
      }
      
      console.log("📥 === API RESPONSE RECEIVED ===");
      console.log("📥 Categories in API response:", apiContactData.categories);
  
      // STEP 4: Update state with API response
      console.log("🔄 === UPDATING STATE ===");
      // Update categories state with new categories that have correct IDs
      setCategories(prev => {
        const updated = [...prev];
        idMappings.forEach((newId, oldId) => {
          const index = updated.findIndex(cat => cat.id === oldId);
          if (index !== -1) {
            updated[index] = { ...updated[index], id: newId, isPersisted: true };
          }
        });
        return updated;
      });
      
      setContactData(apiContactData);
      
      const finalFormData = ApiDataToFormData(apiContactData);
      setFormData(finalFormData);
      
      setExpandedNotes(false);
      setIsEditing(false);
      setHasSubmitted(false);
      setErrors({});
      
      console.log("✅ === SAVE COMPLETED SUCCESSFULLY ===");
      
    } catch (error) {
      console.error('❌ Error updating contact:', error);
      setError(`Failed to update contact: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };


  const handleCancel = () => {
    if (!formData) return;

    const originalFormData = ApiDataToFormData(contactData);
    setFormData(originalFormData);

    // Remove any new categories that weren't in the original categories list
    const originalCategoryIds = contactData.categories ? contactData.categories.map(cat => cat.id) : [];
    setCategories(prevCategories => 
      prevCategories.filter(cat => originalCategoryIds.includes(cat.id))
    );

    setIsEditing(false);
    setHasSubmitted(false);
    setExpandedNotes(false);
    setErrors({});
    
    // Reset UI states based on original data
    setShowBirthdate(!!originalFormData.birthdate);
    setShowAddress(
      !!(originalFormData.streetAndNr || originalFormData.city || 
        originalFormData.country || originalFormData.postalcode)
    );
    setShowContactDetails(
      !!(originalFormData.lastContactDate || originalFormData.nextContactDate)
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
    return (
     <div className=" flex flex-col items-center min-h-screen bg-white dark:bg-black" 
        style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
          <form onSubmit={handleSave}>
            

            {/* Main Edit Contact Card */}
            <div className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] mx-auto"
                style={{ 
                    boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
                }}>
                <h1 className="text-3xl font-bold text-center mt-6 mb-10 text-black">
                    edit <span className="text-red-500">{formData.firstName}.</span>
                </h1>

                
                {/* Favorite Checkbox */}
                <div className="flex items-center w-full relative left-2 mt-3 mb-9 rounded-lg">
                    <button
                        type="button"
                        onClick={handleFavoriteToggle}
                        // onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                        className="flex items-center space-x-2 hover:scale-110 transform"
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
                

                {/* Main Contact Informations */}
                <div className="space-y-8 mb-5">

                    {/* Name & Category */}
                    <div className="space-y-5">
                        {/* First Name Field */}
                        <div className="relative">
                            
                            <input 
                                type="text" 
                                name="firstName" 
                                id="firstName" 
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="meryl"
                                disabled={isLoading}
                                className={`w-full rounded-xl border bg-white  hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                    hasSubmitted && errors.firstName ? 'border-red-400 ' : 'border-gray-400 dark:border-gray-400'
                                }`}
                                style={{
                                    fontSize: '17px',
                                    fontWeight: 200
                                }}
                            />
                            <label 
                                htmlFor="firstName" 
                                className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
                            >
                                first name
                            </label>
                            {hasSubmitted && errors.firstName && (
                                <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">{errors.firstName}</p>
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
                                disabled={isLoading}
                                className={`w-full rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                    hasSubmitted && errors.lastName ? 'border-red-500 shadow-md' : 'border-gray-400 dark:border-gray-400'
                                }`}
                                style={{
                                    fontSize: '17px',
                                    fontWeight: 200
                                }}
                            />
                            <label 
                                htmlFor="lastName" 
                                className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
                            >
                                last name
                            </label>
                            {hasSubmitted && errors.lastName && (
                                <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">{errors.lastName}</p>
                            )}
                        </div>

                        {/* Category Field */}
                        <div className="relative">
                            <CategorySelection 
                                formData={formData}
                                categories={categories}
                                showCategoryDropdown={showCategoryDropdown}
                                setShowCategoryDropdown={setShowCategoryDropdown}
                                showAddCategory={showAddCategory}
                                setShowAddCategory={setShowAddCategory}
                                newCategoryName={newCategoryName}
                                setNewCategoryName={setNewCategoryName}
                                isAddingCategory={isAddingCategory}
                                addCategory={addCategory}
                                addCategoryToForm={addCategoryToForm}
                                removeCategoryFromForm={removeCategoryFromForm}
                                hasSubmitted={hasSubmitted}
                                errors={errors}
                                disabled={false}
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="ml-2"> 

                            {/* isContacted Checkbox */}
                            <div className="flex items-center w-full relative rounded-lg">
                                <button
                                    type="button"
                                    onClick={handleIsContactedToggle}
                                    className="flex items-center space-x-3 text-red-500"
                                    disabled={isLoading}
                                >
                                    {formData.isContacted ? (
                                        <>
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                          </svg>

                                            <span className="text-sm font-extralight text-black cursor-pointer">
                                                contacted
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="black" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                          </svg>
                                            <span className="text-sm font-extralight text-black cursor-pointer">
                                                mark as contacted
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* isToContact Checkbox */}
                            <div className="flex items-center w-full relative">
                                <button
                                    type="button"
                                    onClick={handleIsToContactToggle}
                                    className="flex items-center space-x-3 mt-2 text-red-500 hover:text-red-500"
                                    disabled={isLoading}
                                >
                                    {formData.isToContact ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                            </svg>

                                            <span className="text-sm font-extralight text-black cursor-pointer">
                                                remind me
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="black" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                          </svg>
                                            <span className="text-sm font-extralight text-black cursor-pointer">
                                                reminder
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    

                    {/* How to contact */}
                    <div className="space-y-2">
                        <p className="relative tracking-wide -mb-2 text-red-500 left-2 font-extralight">how to contact?</p>
                            {/* email Field */}
                            <div className="relative mb-4">
                                <label htmlFor="email" className="relative left-4 bg-white px-1 text-base text-black font-extralight">
                                    email
                                </label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="your@email.com"
                                    disabled={isLoading}
                                    className={`w-full rounded-xl border -mt-3 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                        hasSubmitted && errors.email ? 'border-red-500 shadow-md' : 'border-gray-400 dark:border-gray-400'
                                    }`}
                                    style={{
                                        fontSize: '17px',
                                        fontWeight: 200
                                    }}
                                />
                                {hasSubmitted && errors.email && (
                                    <p className="absolute top-full right-1 text-sm font-extralight text-red-600 z-20">{errors.email}</p>
                                )}
                            </div>
                            
                    
                        <div>
                            {/* phone Field */}
                            <div className="relative mb-5">
                                <label htmlFor="phone" className="relative left-4 bg-white px-1 text-base text-black font-extralight">
                                    phone
                                </label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    id="phone" 
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+49 1781234567"
                                    disabled={isLoading}
                                    className={`w-full rounded-xl border -mt-3 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                        hasSubmitted && errors.phone ? 'border-red-500 shadow-md' : 'border-gray-400 dark:border-gray-400'
                                    }`}
                                    style={{
                                        fontSize: '17px',
                                        fontWeight: 200
                                    }}
                                />
                                {hasSubmitted && errors.phone && (
                                    <p className="absolute top-full right-1 font-extralight text-sm text-red-600 z-20">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Optional Address Toggle */}
                        <div className="relative">
                            {!showAddress ? (
                                <button
                                    type="button"
                                    onClick={() => setShowAddress(true)}
                                    className="flex items-center ml-1.5 -mt-1 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
                                    disabled={isLoading}
                                >
                                    <span className="text-lg font-semibold">+</span>
                                    <span className="text-base text-black hover:text-red-500">add address</span>
                                </button>
                            ) : (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="relative left-2 mt-2 mb-3 tracking-wide text-sans font-extralight text-red-500 font-md">
                                            address information
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddress(false);
                                                setFormData(prev => ({ 
                                                    ...prev, 
                                                    streetAndNr:'', 
                                                    postalcode: '', 
                                                    city: '', 
                                                    country: '' 
                                                }));
                                            }}
                                            className="relative -mb-2 right-1 text-red-500 hover:text-red-700 transition-colors duration-200 text-sm font-extralight"
                                            disabled={isLoading}
                                        >
                                            remove
                                        </button>
                                    </div>
                                    
                                    {/* Address Field */}
                                    <div className="relative">
                                        <label htmlFor="streetAndNr" className="absolute -top-3 left-4 bg-white px-1 text-sans text-base text-black font-extralight">
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
                                            className={`w-full rounded-xl border -mb-1 border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                            style={{
                                                fontSize: '17px',
                                                fontWeight: 200
                                            }}
                                        />
                                        {hasSubmitted && errors.streetAndNr && (
                                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.streetAndNr}</p>
                                        )}
                                    </div>

                                    {/* Postal Code and City in a row */}
                                    <div className="flex space-x-4">
                                        <div className="relative flex-1">
                                            <label htmlFor="postalcode" className="relative top-3 bg-white px-1 left-4 text-sans text-base text-black font-extralight">
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
                                                className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                                style={{
                                                    fontSize: '17px',
                                                    fontWeight: 200
                                                }}
                                            />
                                            {hasSubmitted && errors.postalcode && (
                                                <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.postalcode}</p>
                                            )}
                                        </div>

                                        <div className="relative flex-1">
                                            <label htmlFor="city" className="relative top-3 bg-white px-1 left-4 text-sans text-base text-black font-extralight">
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
                                                className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[150px] h-[48px] focus:outline-none focus:border-red-500`}
                                                style={{
                                                    fontSize: '18px',
                                                    fontWeight: 200
                                                }}
                                            />
                                            {hasSubmitted && errors.city && (
                                                <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.city}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Country Field */}
                                    <div className="relative">
                                        <label htmlFor="country" className="relative top-3 bg-white px-1 left-4 text-sans text-base text-black font-extralight">
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
                                            className={`w-full rounded-xl mb-5 border border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                            style={{
                                                fontSize: '18px',
                                                fontWeight: 200
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


                 
                    <div className="space-y-3"> 
                        <div className="">
                            {/* Contact History Fields */}
                            <div className="relative ">
                              <p className="font-text text-base font-extralight tracking-wide text-red-500 ml-1 mt-6 ">date and place of</p>
                                <label htmlFor="lastContactDate" className="relative left-4 bg-white px-1 text-sans text-base text-black font-extralight">
                                    last contact
                                </label>
                                <input 
                                    type="text" 
                                    name="lastContactDate" 
                                    id="lastContactDate" 
                                    value={formData.lastContactDate}
                                    onChange={handleInputChange}
                                    placeholder="am 19.05.2025 in Berlin"
                                    disabled={isLoading}
                                    className={`w-full rounded-xl border -mt-3 border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                    style={{
                                        fontSize: '17px',
                                        fontWeight: 200
                                    }}
                                />
                                {hasSubmitted && errors.lastContactDate && (
                                    <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.lastContactDate}</p>
                                )}
                            </div>

                            {/* Next Contact Field */}
                            <div className="relative -mt-1">
                                <label htmlFor="nextContactDate" className="relative top-3 left-4 bg-white px-1 text-sans text-base text-black font-extralight">
                                    next planned contact
                                </label>
                                <input 
                                    type="text" 
                                    name="nextContactDate" 
                                    id="nextContactDate" 
                                    value={formData.nextContactDate}
                                    onChange={handleInputChange}
                                    placeholder="coffe shop, berlin ..."
                                    disabled={isLoading}
                                    className={`w-full mb-5 rounded-xl border border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                    style={{
                                        fontSize: '17px',
                                        fontWeight: 200
                                    }}
                                />
                                {hasSubmitted && errors.nextContactDate && (
                                    <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.nextContactDate}</p>
                                )}
                            </div>    
                        </div>
                    </div>
                
                    {/* Notes */}
                    <div className="relative">   
                        {/* Notes Field */}
                        <p className="relative tracking-wide text-red-500 -mt-2 left-2  font-extralight">additional information</p>

                        <div className="flex items-center justify-between mt-1">
                            <label htmlFor="notes" className="relative bg-white px-1 left-4 text-sans text-base text-black font-extralight">
                                important notes
                            </label>
                        </div>
                        <textarea 
                            name="notes" 
                            id="notes" 
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="every thought matters.."
                            disabled={isLoading}
                            rows={expandedNotes ? 6 : 3}
                            className={`w-full rounded-xl -mt-3 pt-4 border border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                            style={{
                                fontSize: '17px',
                                fontWeight: 200,
                                height: expandedNotes ? 'auto' : 'auto'
                            }}
                        />
                        {hasSubmitted && errors.notes && (
                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.notes}</p>
                        )}
                    </div>

                    {/* Optional Links */}
                    <div className="relative space-y-3">
                        {/* Links Toggle and Fields */}
                        {!showLinks ? (
                            <button
                                type="button"
                                onClick={() => setShowLinks(true)}
                                className="flex items-center ml-1.5 -mt-5 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
                                disabled={isLoading}
                            >
                                <span className="text-lg font-semibold">+</span>
                                <span className="text-base text-black hover:text-red-500">add weblinks</span>
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center -mt-3 -mb-2 justify-between">
                                    <span className="relative left-2 text-sans font-extralight text-red-500 font-md">
                                        websites & links
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                        setShowLinks(false);
                                        setLinks([{ title: '', url: '' }]);
                                    }}
                                        className="text-red-500 -mb-1 mr-2 font-extralight hover:text-red-700 text-sm"
                                        disabled={isLoading}
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
                                            disabled={isLoading}
                                            className="flex relative p-2.5 w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 min-w-[100px] max-w-[120px] h-[48px] focus:outline-none focus:border-red-500"
                                            style={{
                                                fontSize: '17px',
                                                fontWeight: 200
                                            }}
                                        />
                                        <input 
                                            type="url" 
                                            value={link.url}
                                            onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                            placeholder="https://example.com"
                                            disabled={isLoading}
                                            className="flex p-2.5 w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500"
                                            style={{
                                                fontSize: '17px',
                                                fontWeight: 200
                                            }}
                                        />
                                        {links.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeLink(index)}
                                                className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1"
                                                disabled={isLoading}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                
                                <button
                                    type="button"
                                    onClick={addLink}
                                    className="flex ml-1.5 items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight text-normal"
                                    disabled={isLoading}
                                >
                                    <span className="mt-1 font-semibold text-lg">+</span>
                                    <span className="mt-1 text-black hover:text-red-500">add another link</span>
                                </button>
                            </div>
                        )}
                    </div> 
                    <div className="relative">
                            {!showBirthdate ? (
                                <button
                                    type="button"
                                    onClick={() => setShowBirthdate(true)}
                                    className="ml-1.5 flex items-center space-x-2 -mt-8 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
                                    disabled={isLoading}
                                >
                                    <span className="text-lg font-semibold">+</span>
                                    <span className="text-base text-black hover:text-red-500">birthdate</span>
                                </button>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <p className="relative -mb-1 left-4 bg-white p-1 text-sans font-extralight text-black font-md">
                                            birthdate
                                        </p>
                                        <span className="relative -mt-4 right-1 font-extralight">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowBirthdate(false);
                                                    setFormData(prev => ({ ...prev, birthdate: '' }));
                                                }}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                                disabled={isLoading}
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
                                        placeholder="18.04.1995"
                                        disabled={isLoading}
                                        className={`w-full -mt-3 rounded-xl border border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                                        style={{
                                            fontSize: '17px',
                                            fontWeight: 200
                                        }}
                                    />
                                    {hasSubmitted && errors.birthdate && (
                                        <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.birthdate}</p>
                                    )}
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
                    <div className="fixed font-extralight inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
                      <div className="bg-white rounded-3xl p-8 relative overflow-visible w-[85vw] min-w-[280px] max-w-[400px] mx-auto"
                          style={{ 
                            boxShadow: '0 8px 48px rgba(109, 71, 71, 0.35)'
                          }}>
                        
                        {/* Warning Icon */}
                        <div className="flex justify-center mb-6">
                          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                            <svg 
                              className="w-8 h-8 text-red-500 font-extralight" 
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
                        <p className="text-center text-black tracking-wider font-extralight mb-8 leading-relaxed">
                          this action cannot be undone. all contact information, notes, and history will be permanently removed.
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                          {/* Cancel Button */}
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirmation(false)}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-6 rounded-xl font-extralight border-2 border-gray-300 text-black tracking-wide font-md hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="text-black dark:text-white font-extralight block mt-2 relative -ml-48 mb-36"
                style={{ fontSize: '16px' }}>
                want to cancel? {' '}
                <button 
                    onClick={handleCancel}
                    className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer"
                    disabled={isSaving}
                >
                    go back.
                </button>
            </div>
          </form>
      </div>
    );
  }



  // VIEW MODE
  console.log("Contact Mode Showing")
  return (
    <div className=" flex flex-col items-center min-h-screen bg-white dark:bg-black" 
        style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
      
        {/* Navigation Button */}
        <div className="relative mt-6 -mb-6  ">
          <Button 
              onClick={() => navigate(-1)}
              className="text-black dark:text-white hover:text-red-500"
              >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
              </svg>
          </Button>
        </div>


        {/* Contact Display Card */}
        <div className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] h-fit mx-auto mt-10 "
            style={{ 
                boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
            }}>
        
        
        <div className="text-center mb-9 space-y-8">
          {/* Name and Favorite */}
          <div className="flex items-center justify-center space-x-5 -mb-4 mt-8">
            <h1 className="text-3xl ml-8 font-bold text-black">
              {contactData.first_name} {contactData.last_name}
            </h1>
          
            {/* Favorite checkbox */}
            <div className="flex items-center pr-6">
                <button
                        type="button"
                        onClick={handleFavoriteToggle} 
                        className="flex items-center hover:scale-110 transcontact"
                        disabled={isLoading}
                    >
                    <svg 
                        className={`w-7 h-7 ${
                            contactData.is_favorite ? 'text-red-500 hover:text-yellow-300' : 'text-black hover:text-yellow-300'
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
          
          {/* Categories Display */}
          {contactData && contactData.categories && contactData.categories.length > 0 && (
            <div className="w-full justify-center mx-auto flex-wrap space-x-2 mt-1">
                {contactData.categories.map((category, index) => (
                    <span 
                    key={category.id || index} 
                    onClick={() => navigate(`/myspace/categories?expand=${category.id}`)}
                    className="inline-block px-3 py-2 min-w-[90px] border border-red-50 bg-red-50 tracking-wide hover:bg-red-100 text-red-700 rounded-full text-base font-extralight">
                        {category.name}
                    </span>
                ))}
            </div>
          )}
        </div>


        {/* Contact Information */}
        <div className="space-y-7 mb-7">

          {/* Checkboxes */}
          <div className="ml-2"> 

              {/* isContacted Checkbox */}
              <div className="flex items-center w-full relative rounded-lg">
                  <button
                      type="button"
                      onClick={handleIsContactedToggle} // FIXED: Use the correct handler
                      className="flex items-center space-x-3 text-red-700 "
                      disabled={isLoading}
                  >
                      {contactData.is_contacted ? ( // FIXED: Use contactData instead of formData
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>

                              <span className="text-sm font-extralight text-black cursor-pointer">
                                  contacted
                              </span>
                          </>
                      ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="black" className="size-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                              <span className="text-sm font-extralight text-black cursor-pointer">
                                  mark as contacted
                              </span>
                          </>
                      )}
                  </button>
              </div>

              {/* isToContact Checkbox */}
              <div className="flex items-center w-full relative">
                  <button
                      type="button"
                      onClick={handleIsToContactToggle} // FIXED: Use the correct handler
                      className="flex items-center space-x-3 mt-2 text-red-700 hover:text-red-500"
                      disabled={isLoading}
                  >
                      {contactData.is_to_contact ? ( // FIXED: Use contactData instead of formData
                          <>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                              </svg>

                              <span className="text-sm font-extralight text-black cursor-pointer">
                                  remind me
                              </span>
                          </>
                      ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="black" className="size-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                              <span className="text-sm font-extralight text-black cursor-pointer">
                                  reminder
                              </span>
                          </>
                      )}
                  </button>
              </div>

          </div>
          
          {/* <div className="">
              <h2 className="ml-3 font-text text-normal text-red-700 font-light -mb-5">How to contact?</h2>
          </div> */}
    
            {/* Contact Methods */}
            {(contactData.email || contactData.phone) && (
              <div className="">
                <h2 className="text-red-700 font-light text-[15px] -mb-2 ml-3">mail & phone number</h2>
                <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                  {/* Email */}
                  {contactData.email && (
                    <div className="flex items-start">
                      <span className="text-gray-500 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                      </span>
                      <div className="ml-3">
                        <a 
                          href={`mailto:${contactData.email}`}
                          className="text-black text-[17px] font-extralight hover:text-red-500 transition-colors"
                        >
                          {contactData.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Phone */}
                  {contactData.phone && (
                    <div className="flex items-start">
                      <span className="text-gray-500 font-extralight text-sm mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                        </svg>
                      </span>
                      <div className="ml-3">
                        <a 
                          href={`tel:${contactData.phone}`}
                          className="text-black text-[17px] font-extralight hover:text-red-500 transition-colors"
                        >
                          {contactData.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Address */}
            {(contactData.street_and_nr || contactData.city || contactData.country) && (
              <div className="space-y-2">
                  <h3 className="text-red-700 font-light text-[15px] -mt-3 ml-3 -mb-4">address</h3>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [
                      contactData.street_and_nr,
                      contactData.postal_code,
                      contactData.city,
                      contactData.country
                    ]
                      .filter(Boolean) // Remove empty values
                      .join(', ')
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-3 cursor-pointer"
                  title="Open in Google Maps"
                >
                  <span className="flex items-center justify-start">
                    {/* Small indicator */}
                    <svg 
                      className="w-4 h-4 text-gray-300" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                </span>
                  <div className="text-black text-[17px]  font-extralight -space-y-1 -mt-5 ml-6">
                    {contactData.street_and_nr && <div>{contactData.street_and_nr},</div>}
                    <div>
                      {contactData.postal_code && `${contactData.postal_code} `}
                      {contactData.city},
                    </div>
                    {contactData.country && <div>{contactData.country}</div>}
                  </div>
                </a>
              </div>
            )}

            {/* Birthday */}
              {contactData.birth_date && (
                <div>
                  <h3 className="text-red-700 font-light text-[15px] ml-3 -mt-2">date of birth</h3>
                  <div className="bg-gray-50 rounded-xl p-3 -mt-2">
                    <div className="text-black text-[17px] tracking-wide font-extralight ml-6">
                      {contactData.birth_date}
                    </div>
                  </div>
                </div>
              )}



            {/* Contact History */}
            {(contactData.last_contact_date || contactData.next_contact_date) && (
   
              <div className="mb-8 bg-gray-50 rounded-xl">
                {/* last contact */}
                {contactData.last_contact_date && (
                   <>
                    <h3 className="text-red-700 text-[15px] ml-3 -mb-6"><span className="font-extralight">last date of contact:</span></h3>
                    <div className="p-3 pt-5">
                        <div className="text-black text-[16px] font-extralight">
                          {contactData.last_contact_date}
                        </div>
                    </div>
                  </>  
                )}

                  {/* next contact */}
                  {contactData.next_contact_date && (
                  <>
                    <h3 className="text-red-700 font-extralight text-[15px] ml-3 -mb-6"><span className="font-extralight">next planned contact:</span></h3>
                    <div className="p-3 -mt-2 pt-5">
                        <div className="text-black text-[17px] font-extralight">
                          {contactData.next_contact_date}
                        </div>
                    </div>
                  </>  
                )}
            </div>
            )}

            {/* Notes */}
            {contactData.notes && (
              <div className="">
                <h3 className="text-red-700 font-light text-[16px] ml-3 -mt-3">notes</h3>
                <div className="bg-gray-50 rounded-xl p-3 -mt-2 min-h-[100px]">
                  <div className="text-black text-[17px] font-extralight whitespace-pre-wrap ">
                    "{contactData.notes}"
                  </div>
                </div>
              </div>
            )}

          </div>
      
          {(contactData.birth_date || contactData.links.some(link => link.url?.trim() && link.title?.trim())) && (
            <div className="space-y-2 mt-5 mb-8">
              {/* Links */}
              {contactData.links && contactData.links.some(link => link.url?.trim() && link.title?.trim()) && (
                <div className="space-y-2">
                  <h3 className="text-red-700 font-light text-normal ml-3 -mb-3">links</h3>
                  <div className="flex space-y-2">
                    {contactData.links
                      .filter(link => link.url?.trim() && link.title?.trim()) // Only show links with both URL and title
                      .map((link, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-3 pt-2 hover:text-red-500">
                          <a 
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 text-[17px] font-extralight hover:text-red-500 transition-colors break-all"
                          >
                            {link.title}
                          </a>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              
            </div>
          )}

        
      
      
      
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
      <div className="w-full px-8 pt-2 space-y-0.25 max-w-[480px] pb-28">
        <div className="text-black dark:text-white font-extralight block relative"
            style={{ fontSize: '16px' }}>
          want to go {' '}
          <button 
            onClick={() => navigate('/myspace/contacts')}
            className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer"
          >
          to contacts?
          </button>
        </div>
        <div className="text-black dark:text-white font-extralight block -mt-2 relative"
            style={{ fontSize: '16px' }}>
          or go {' '}
          <button 
            onClick={handleGoBack}
            className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer"
          >
          back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowContactForm;