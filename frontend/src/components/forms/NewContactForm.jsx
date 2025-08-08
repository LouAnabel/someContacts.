import React, { useState, useEffect } from 'react';
import CircleButton from '../ui/Buttons';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContextProvider';
import { createContact, getCategories } from '../../apiCalls/contactsApi';
import FormDataToApiData from '../helperFunctions/FormToApiData';
import { validateDate } from '../helperFunctions/dateConversion';
import CategorySelection from '../ui/CategorySelection';


const NewContactForm = ({onSubmit, onCancel }) => {
    const navigate = useNavigate();
    const { accessToken } = useAuthContext();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        categories: [],
        email: '',
        phone: '',
        isFavorite: false,
        birthdate: '',
        streetAndNr: '',
        postalcode: '',
        city: '',
        country: '',
        notes: '',
        isContacted: false,
        isToContact: false,
        lastContactDate: '',
        nextContactDate: '',
        links: []
    });

    // Original Visual State 
    const [errors, setErrors] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [showBirthdate, setShowBirthdate] = useState(false);
    const [showAddress, setShowAddress] = useState(false);
    const [expandedNotes, setExpandedNotes] = useState(false);
    const [showContactDetails, setShowContactDetails] = useState(false);

    const [showLinks, setShowLinks] = useState(false);
    const [links, setLinks] = useState([{ title: '', url: '' }]);


    // ies State
    const [categories, setCategories] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);


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

    const handleGoBack = () => {
        navigate(-1);
    }

    // LOADING CATEGORIES TO DATABASE 
    const addCategory = async () => {
        if (newCategoryName.trim() && !isAddingCategory) {
            setIsAddingCategory(true);
            
            try {
                const categoryName = newCategoryName.charAt(0).toUpperCase() + newCategoryName.slice(1).trim();
                console.log('Adding category:', categoryName);
                
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
                    const errorText = await response.text();
                    console.error('API Error:', response.status, errorText);
                    throw new Error(`Failed to add category: ${response.status}`);
                }
                
                const apiResponse = await response.json();
                console.log('API Response for new category:', apiResponse);
                
                const newCategory = {
                    id: apiResponse.id || apiResponse.category?.id || Date.now(),
                    name: apiResponse.name || apiResponse.category?.name || categoryName,
                    creator_id: apiResponse.creator_id || apiResponse.category?.creator_id || 1,
                    contact_count: apiResponse.contact_count || apiResponse.category?.contact_count || 0 
                };
                
                setCategories(prevCategories => [...prevCategories, newCategory]);
                
                // UPDATED: Add to categories array instead of replacing single category
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
                
                console.log('Category added successfully:', newCategory.name);
                
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

        // UPDATED: Categories validation (at least one required)
        if (!formData.categories || formData.categories.length === 0) {
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
        if (formData.birthdate) {
            const birthdateError = validateDate(formData.birthdate, 'Birthdate', true);
            if (birthdateError) {
                newErrors.birthdate = birthdateError;
            }
        }
        
        setErrors(newErrors);
        console.log("errors:", newErrors)
        return Object.keys(newErrors).length === 0;
    };
    
    // HANDLE SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        setHasSubmitted(true);
        
        if (!validateForm()) {
            console.error('Form validation failed:', errors);
            return;
        }
        
        setIsLoading(true);

        try {
            if (!accessToken) {
                throw new Error("Access token is not available.");
            }

            // Prepare data for API call in HelperFunction
            const contactData = FormDataToApiData(formData, categories, links);
                console.log('Submitted contact data:', contactData);

            // Call API to create contact
            const NewContactData = await createContact(accessToken, contactData);
            console.log('New contact created, newContactData:', NewContactData);

            // Call the onSubmit prop if provided
            if (onSubmit) {
                onSubmit(NewContactData);
            }
            // Reset form after successful creation
            resetForm();

            // navigate to the new contact page
            if (NewContactData && NewContactData?.id) {
                navigate(`/myspace/contacts/${NewContactData?.id}`, { replace: true });
            } else {
                console.error('New contact data is missing ID:', NewContactData?.id);
                navigate("/myspace/contacts", { replace: true });
            }

        } catch (error) {
        setErrors(prev => ({ ...prev, submit: `Failed to create contact: ${error.message}` }));
        console.error('Error creating contact:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        // Reset form after successful creation
        setFormData({
            firstName: '',
            lastName: '',
            categories: [],
            email: '',
            phone: '',
            isFavorite: false,
            birthdate: '',
            streetAndNr: '',
            postalcode: '',
            city: '',
            country: '',
            notes: '',
            isContacted: false,
            isToContact: false,
            lastContactDate: '',
            nextContactDate: '',
        });


        setShowBirthdate(false);
        setShowAddress(false);
        setShowContactDetails(false);
        setShowLinks(false);
        setExpandedNotes(false);
        setLinks([{ title: '', url: '' }]);
        setHasSubmitted(false);
        setErrors({});
      
    };
    
    const handleCancel = () => {
        resetForm();
        if (onCancel) {
            onCancel();
        } else {
            navigate('/myspace/');
        }
    };

    return (
    <form onSubmit={handleSubmit}>
        <div className="w-full flex flex-col items-center min-h-screen bg-white dark:bg-black" 
            style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
            

            {/* Main Edit Contact Card */}
            <div className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] mx-auto"
                style={{ 
                    boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
                }}>
                <h1 className="text-3xl font-bold text-center mt-6 mb-10 text-black">
                    new contact.
                </h1>
                {/* Favorite Checkbox */}
                <div className="flex items-center w-full relative left-2 mt-3 mb-9 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
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
                        <span className="text-sm font-extralight text-black cursor-pointer">
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
                                className={`w-full rounded-xl border bg-white  hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                    hasSubmitted && errors.firstName ? 'border-red-400 ' : 'border-gray-400 dark:border-gray-400'
                                }`}
                                style={{
                                    fontSize: '18px',
                                    fontWeight: 300
                                }}
                            />
                            <label 
                                htmlFor="firstName" 
                                className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
                            >
                                first name
                            </label>
                            {hasSubmitted && errors.firstName && (
                                <p className="absolute top-full right-1 font-extralight text-sm text-red-600 z-20">{errors.firstName}</p>
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
                                className={`w-full rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                    hasSubmitted && errors.lastName ? 'border-red-500 shadow-md' : 'border-gray-400 dark:border-gray-400'
                                }`}
                                style={{
                                    fontSize: '18px',
                                    fontWeight: 300
                                }}
                            />
                            <label 
                                htmlFor="lastName" 
                                className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
                            >
                                last name
                            </label>
                            {hasSubmitted && errors.lastName && (
                                <p className="absolute top-full right-1 font-extralight text-sm text-red-600 z-20">{errors.lastName}</p>
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
                                    onClick={() => setFormData(prev => ({ ...prev, isContacted: !prev.isContacted }))}
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
                                    onClick={() => setFormData(prev => ({ ...prev, isToContact: !prev.isToContact }))}
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
                                <label htmlFor="email" className="relative left-4 bg-white px-1 text-normal text-black font-extralight">
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
                                        fontSize: '16px',
                                        fontWeight: 300
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
                                        fontSize: '16px',
                                        fontWeight: 300
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
                                    className="flex items-center ml-1.5 -mt-2 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
                                    disabled={isLoading}
                                >
                                    <span className="text-lg font-semibold">+</span>
                                    <span className="text-base text-black hover:text-red-500">add address</span>
                                </button>
                            ) : (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="relative left-2 -mt-2 mb-4 text-sans font-extralight text-red-500 font-md">
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
                                            className="relative -mb-3 right-1 text-red-500 hover:text-red-700 transition-colors duration-200 text-sm font-extralight"
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
                                                    fontSize: '16px',
                                                    fontWeight: 300
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


                    <div className="space-y-3">
                        <div className="">
                            {/* Contact History Fields */}
                            <div className="relative -mt-1">
                              <p className="font-text text-base font-extralight tracking-wide text-red-500 ml-1 mt-6 mb-1">date and place of</p>
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
                                        fontSize: '16px',
                                        fontWeight: 300
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
                                        fontSize: '16px',
                                        fontWeight: 300
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
                        <p className="relative tracking-wide text-red-500 -mt-2 left-2 mb-2 font-extralight">additional information</p>
                        <div className="flex items-center justify-between -mt-1">
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
                                fontSize: '16px',
                                fontWeight: 300,
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
                                className="flex items-center ml-1.5 -mt-6 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
                                disabled={isLoading}
                            >
                                <span className="text-lg font-semibold">+</span>
                                <span className="text-lg text-black hover:text-red-500">add weblinks</span>
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center -mt-5 -mb-2 justify-between">
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
                                                fontSize: '16px',
                                                fontWeight: 300
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
                                                fontSize: '16px',
                                                fontWeight: 300
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
                                    className="flex ml-1.5 items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight text-sm"
                                    disabled={isLoading}
                                >
                                    <span className="mt-1 text-base">+</span>
                                    <span className="mt-1 text-base text-black hover:text-red-500">add another link</span>
                                </button>
                            </div>
                        )}
                    </div> 

                    <div className="relative">
                        {!showBirthdate ? (
                            <button
                                type="button"
                                onClick={() => setShowBirthdate(true)}
                                className="ml-1.5 flex items-center -mt-7 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
                                disabled={isLoading}
                            >
                                <span className="text-lg font-semibold">+</span>
                                <span className="text-base text-black hover:text-red-500">birthdate</span>
                            </button>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between">
                                    <p className="relative -mt-2 left-2 mb-3 text-sans font-extralight text-red-500 font-md">
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
                </div> 

                {/* Circle Button - Outside the space-y-6 div but inside the card */}
                <CircleButton
                    type="submit"
                    size="xl"
                    variant="dark"
                    className=" font-semibold absolute -bottom-[85px] -right-[10px]"
                    style={{ 
                        marginTop: '2rem', 
                        marginLeft: 'auto', 
                        display: 'block' 
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? '. . .' : 'save.'}
                </CircleButton>
            </div>

            {/* Back Links */}
            <div className="w-full px-8 mt-2 space-y-0.25 max-w-[480px]">
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
                <div className="text-black font-extralight dark:text-white block -mt-1 relative"
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
    </form>
    )
}

export default NewContactForm;