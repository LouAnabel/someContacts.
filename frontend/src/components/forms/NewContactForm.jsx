import React, { useState } from 'react';
import CircleButton from '../ui/Buttons';
import { useNavigate } from 'react-router-dom';

const NewContactForm = ({ contact = {}, onSubmit, onCancel }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        category: '',
        email: '',
        phone: '',
        isFavorite: false,
        birthdate: '',
        streetAndNr: {},
        postalcode: '',
        city: '',
        country: '',
        notes: '',
        lastContactDate: '',
        meetingPlace: ''
    });

    const [errors, setErrors] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    const [showBirthdate, setShowBirthdate] = useState(false);
    const [showAddress, setShowAddress] = useState(false);
    const [expandedNotes, setExpandedNotes] = useState(false);
    const [showContactDetails, setShowContactDetails] = useState(false);
    const [showLinks, setShowLinks] = useState(false);
    const [links, setLinks] = useState(['']);

    const [categories, setCategories] = useState([
        {id: 1, value: "caster"},
        {id: 2, value: "producer"},
        {id: 3, value: "friends"}
    ]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

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
            const newLinks = links.filter((_, i) => i !== index);
            setLinks(newLinks);
        }
    };

    // LOADING CATEGORIES FROM DATABASE
    // useEffect(() => {
    //     const loadCategories = async () => {
    //         try {
    //             const response = await fetch('/api/categories');
    //             const categoriesFromDB = await response.json();
    //             setCategories(categoriesFromDB);
    //         } catch (error) {
    //             console.error('Failed to load categories:', error);
    //         }
    //     };
    //     loadCategories();
    // }, []);

    const addCategory = async () => {
        if (newCategoryName.trim() && !isAddingCategory) {
            setIsAddingCategory(true);
            
            try {
                // ADD CATEGORIES TO DATABASE
                // const response = await fetch('/api/categories', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ 
                //         name: newCategoryName.trim(),
                //         value: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
                //         label: `${newCategoryName.trim()}`
                //     })
                // });
                
                // if (!response.ok) throw new Error('Failed to add category');
                // const newCategory = await response.json();
                
                // Simulate API call for demo
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Create new category object (in real app, this comes from API response)
                const newCategory = {
                    id: Date.now(), // In real app, this would come from your database
                    value: newCategoryName.toLowerCase().replace(/\s+/g, '_')
                };
                
                // Update local state
                setCategories(prev => [...prev, newCategory]);
                setFormData(prev => ({ ...prev, category: newCategory.value }));
                
                // Reset form
                setNewCategoryName('');
                setShowAddCategory(false);
                setShowCategoryDropdown(false);
                
                console.log('New category added:', newCategory);
                
            } catch (error) {
                console.error('Failed to add category:', error);
                // TODO: Show user-friendly error message
                alert('Failed to add category. Please try again.');
            } finally {
                setIsAddingCategory(false);
            }
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
        
        // Last name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        // category validation
        if (!formData.category.trim()) {
            newErrors.category = 'category is required';
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
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setHasSubmitted(true);
        setApiLoading(true);
        
        if (!validateForm()) {
            setApiLoading(false);
            console.error('Form validation failed:', errors);
            return;
        }
        
        // Form is valid, proceed with submission
        console.log('Form validation passed, proceeding with submission...');
        console.log('New contact data:', formData);
        console.log('Links:', links);
        
        // Call the onSubmit prop if provided
        if (onSubmit) {
            onSubmit({ ...formData, links });
        }
        
        // Simulate API call
        setTimeout(() => {
            setApiLoading(false);
            alert('Contact created successfully! Check console for form data.');
            // Reset form after successful creation
            setFormData({
                firstName: '',
                lastName: '',
                category: '',
                email: '',
                phone: '',
                isFavorite: false,
                birthdate: '',
                address: '',
                postalcode: '',
                city: '',
                country: '',
                notes: '',
                lastContactDate: '',
                meetingPlace: ''
            });
            setShowBirthdate(false);
            setShowAddress(false);
            setShowContactDetails(false);
            setShowLinks(false);
            setExpandedNotes(false);
            setLinks(['']);
            setHasSubmitted(false);
            // navigate('/myspace/contacts'); // Uncomment when ready to redirect
        }, 1000);
    };

    const showLoading = apiLoading;

    return (
        <div className="w-full flex flex-col items-center min-h-screen bg-white dark:bg-black" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Edit Contact Card */}
            <div className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] lg:max-w-[720px] h-fit mx-auto"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
                 }}>
                <h1 className="text-3xl font-bold text-center mb-10 text-black">
                    new contact.
                </h1>


                {/* Favorite Checkbox */}
                <div className="flex items-center w-full relative left-1 mt-3 mb-8 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                            className="flex items-center space-x-2 hover:scale-110 transform"
                            disabled={showLoading}
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
                            disabled={showLoading}
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
                            disabled={showLoading}
                            className={`w-full rounded-xl border bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                    hasSubmitted && errors.firstName ? 'border-red-500 shadow-lg' : 'border-gray-400 dark:border-gray-400'
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
                            onClick={() => {
                                setShowCategoryDropdown(!showCategoryDropdown)}}
                            disabled={showLoading}
                            className={`w-full p-2.5 rounded-xl border bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 font-light max-w-full min-w-[200px] focus:outline-none focus:border-red-500 flex items-center justify-between ${
                                hasSubmitted && errors.category ? 'border-red-500 shadow-lg' : 'border-gray-400 dark:border-gray-400'
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 300
                            }}
                        >
                            <span className={formData.category ? 'text-black' : 'text-gray-300'}>
                                {formData.category 
                                    ? categories.find(cat => cat.value === formData.category)?.label || formData.category
                                    : 'select category'
                                }
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
                                {/* Category Options */}
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => {
                                            // Update form data
                                            setFormData(prev => ({ ...prev, category: category.value }));
                                            
                                            // Clear error immediately (same as handleInputChange does)
                                            if (hasSubmitted && errors.category) {
                                                setErrors(prev => ({ ...prev, category: '' }));
                                            }
                                            
                                            // Close dropdown
                                            setShowCategoryDropdown(false);
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-50 hover:text-red-500 text-black font-light last:border-b-0"
                                        style={{ fontSize: '16px', fontWeight: 300 }}
                                    >
                                        {category.value}
                                    </button>
                                ))}
                                
                                {/* Add Category Section */}
                                <div className="border-t border-gray-100">
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
                                                value={newCategoryName.toLowerCase()}
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
                            disabled={showLoading}
                            className={`w-full rounded-xl border bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                    hasSubmitted && errors.firstName ? 'border-red-500 shadow-lg' : 'border-gray-400 dark:border-gray-400'
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
                            disabled={showLoading}
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

                {/* Optional Toggle */}
                <div className="space-y-4 mb-8">
                    {/* Birthdate Toggle and Field */}
                    <div className="space-y-2">
                        <div className="relative">
                            {!showBirthdate ? (
                                <button
                                    type="button"
                                    onClick={() => setShowBirthdate(true)}
                                    className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-light"
                                    disabled={showLoading}
                                >
                                    <span className="text-lg font-semibold">+</span>
                                    <span className="text-base text-black hover:text-red-500">date of birth</span>
                                </button>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="birthdate" className="block relative left-2 top-3 left-4 bg-white px-1 text-sans text-black font-light">
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
                                            disabled={showLoading}
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
                                        disabled={showLoading}
                                        className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 
                                            }`}
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
                                    disabled={showLoading}
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
                                                    address: '', 
                                                    postalcode: '', 
                                                    city: '', 
                                                    country: '' 
                                                }));
                                            }}
                                            className="relative right-1 text-red-500 hover:text-red-700 transition-colors duration-200 text-sm font-light"
                                            disabled={showLoading}
                                        >
                                            remove
                                        </button>
                                    </div>
                                    
                                    {/* Address Field */}
                                    <div className="relative">
                                        <label htmlFor="address" className="absolute -top-3 left-4 bg-white px-1 text-sans text-base text-black font-light">
                                            street & nr°
                                        </label>
                                        <input 
                                            type="text" 
                                            name="address" 
                                            id="address" 
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="greifwalder Str. 8"
                                            disabled={showLoading}
                                            className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 
                                            }`}
                                            style={{
                                                fontSize: '18px',
                                                fontWeight: 300
                                            }}
                                        />
                                        {hasSubmitted && errors.address && (
                                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.address}</p>
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
                                                disabled={showLoading}
                                                className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 
                                                }`}
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
                                                disabled={showLoading}
                                                className={`w-full rounded-xl border border-gray-400  dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[150px] h-[48px] focus:outline-none focus:border-red-500 
                                                }`}
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
                                            disabled={showLoading}
                                            className={`w-full rounded-xl mb-5 border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 
                                            }`}
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

                {/* Notes */}
                <div className="space-y-3.5 mb-8">   
                    {/* Notes Field */}
                    <div className="relative">
                        <p className="relative text-red-500 left-2 -mb-3 mt-5 font-light">notes?</p>
                        <div className="flex items-center justify-between">
                            <label htmlFor="notes" className="relative top-3 bg-white px-1 left-4 text-sans text-base text-black font-light">
                                any important things to remember?
                            </label>
                            {/* <button
                                type="button"
                                onClick={() => setExpandedNotes(!expandedNotes)}
                                className="text-red-500 hover:text-red-600 relative right-1 text-sm font-light"
                                disabled={showLoading}
                            >
                                {expandedNotes ? 'show less' : 'show more'}
                            </button> */}
                        </div>
                        <textarea 
                            name="notes" 
                            id="notes" 
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="every thought matters.."
                            disabled={showLoading}
                            rows={expandedNotes ? 6 : 3}
                            className={`w-full rounded-xl mb-5 border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 
                            }`}
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
                </div>


                {/* Optional Toggle Field */}
                <div className="space-y-2 mb-8">
                    {/* Contact Details Toggle and Fields */}
                    <div className="relative">
                        {!showContactDetails ? (
                            <button
                                type="button"
                                onClick={() => setShowContactDetails(true)}
                                className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-light"
                                disabled={showLoading}
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
                                                lastContactDate: '', 
                                                meetingPlace: '' 
                                            }));
                                        }}
                                        className="relative right-1 font-light text-red-500 hover:text-red-700 transition-colors duration-200 text-sm"
                                        disabled={showLoading}
                                        >
                                            remove
                                    </button>
                                </div>
                                    
                                {/* Last Contact Date Field */}
                                <div className="relative">
                                    <label htmlFor="lastContactDate" className="relative left-2 top-3 left-4 bg-white px-1 text-sans text-base text-black font-light">
                                        the date of your last contact?
                                    </label>
                                    <input 
                                            type="date" 
                                            name="lastContactDate" 
                                            id="lastContactDate" 
                                            value={formData.lastContactDate}
                                            onChange={handleInputChange}
                                            disabled={showLoading}
                                            className={`w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 
                                            }`}
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: 300
                                            }}
                                    />
                                        {hasSubmitted && errors.lastContactDate && (
                                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.lastContactDate}</p>
                                        )}
                                </div>

                                {/* Meeting Place Field */}
                                <div className="relative">
                                    <label htmlFor="meetingPlace" className="relative left-2 top-3 left-4 bg-white px-1 text-sans text-base text-black font-light">
                                            the place where you met?
                                    </label>
                                    <input 
                                            type="text" 
                                            name="meetingPlace" 
                                            id="meetingPlace" 
                                            value={formData.meetingPlace}
                                            onChange={handleInputChange}
                                            placeholder="coffe shop, berlin ..."
                                            disabled={showLoading}
                                            className={`w-full mb-5 rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 
                                            }`}
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
                


                    {/* optional links */}
                    <div className="space-y-3">
                        {/* Links Toggle and Fields */}
                        <div className="relative">
                            {!showLinks ? (
                                <button
                                    type="button"
                                    onClick={() => setShowLinks(true)}
                                    className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-light"
                                    disabled={showLoading}
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
                                                setLinks(['']);
                                            }}
                                            className="text-red-500 hover:text-red-700 transition-colors duration-200 text-sm"
                                            disabled={showLoading}
                                        >
                                            remove
                                        </button>
                                    </div>
                                    
                                    {links.map((link, index) => (
                                        <div key={index} className="relative flex items-center space-x-2">
                                            <input 
                                                type="url" 
                                                value={link}
                                                onChange={(e) => handleLinkChange(index, e.target.value)}
                                                placeholder="https://example.com"
                                                disabled={showLoading}
                                                className="flex-1 p-2.5 w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white shadow-md hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500"
                                                style={{
                                                    fontSize: '16px',
                                                    fontWeight: 400
                                                }}
                                            />
                                            {links.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLink(index)}
                                                    className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1"
                                                    disabled={showLoading}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <button
                                        type="button"
                                        onClick={addLink}
                                        className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-light text-sm"
                                        disabled={showLoading}
                                    >
                                        <span className="text-base">+</span>
                                        <span className="text-black hover:text-red-500">add another link</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>    
                </div> 


                {/* Circle Button - Outside the space-y-6 div but inside the card */}
                <CircleButton
                    size="xl"
                    variant="dark"
                    className="border border-white/30 absolute -bottom-[85px] -right-[10px]"
                    style={{ 
                        marginTop: '2rem', 
                        marginLeft: 'auto', 
                        display: 'block' 
                    }}
                    disabled={showLoading}
                    onClick={handleSubmit}>
                    {showLoading ? '. . .' : 'save.'}
                </CircleButton>
            
                </div>
            {/* dark:bg-red-600 hover:dark:bg-black hover:dark:border hover:dark:border-white */}

            {/* Back Link - Positioned at bottom left of card */}
            <div className="text-black dark:text-white font-light block mt-8 absolute left-[20px]"
                 style={{ fontSize: '16px' }}>
                want to cancel? {' '}
                <button 
                    onClick={() => {
                            navigate('/myspace/');
                    }}
                    className="font-light font-normal text-red-500 hover:underline bg-transparent border-none cursor-pointer"
                >
                    go back.
                </button>
            </div>
            </div>
        </div>
    );
}

export default NewContactForm;