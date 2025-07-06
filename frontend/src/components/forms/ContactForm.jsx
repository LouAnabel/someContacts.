import React, { useState } from 'react';
import CircleButton from '../ui/Buttons';
import { useNavigate } from 'react-router-dom';

const ContactForm = ({ contact = {}, onSubmit, onCancel }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
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
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    const [showBirthdate, setShowBirthdate] = useState(false);
    const [showAddress, setShowAddress] = useState(false);

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
        
        // Call the onSubmit prop if provided
        if (onSubmit) {
            onSubmit(formData);
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
                notes: ''
            });
            setShowBirthdate(false);
            setShowAddress(false);
            setHasSubmitted(false);
            // navigate('/contacts'); // Uncomment when ready to redirect
        }, 1000);
    };

    const showLoading = apiLoading;

    return (
        <div className="min-h-screen bg-white dark:bg-black p-6 absolute top-[90px]" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Edit Contact Card */}
            <div className="bg-gray-50 rounded-3xl p-6 relative z-10 overflow-visible w-[75vw] min-w-[260px] max-w-[480px] h-fit absolute left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(0, 0, 0, 0.3)'
                 }}>
                <h1 className="text-3xl font-bold text-center mb-8 text-black">
                    new contact.
                </h1>

                <div className="space-y-6">
                    {/* First Name Field */}
                    <div className="relative">
                        <label htmlFor="firstName" className="block text-sans text-base text-black font-light">
                            first name
                        </label>
                        <input 
                            type="text" 
                            name="firstName" 
                            id="firstName" 
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="meryl"
                            disabled={showLoading}
                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black placeholder-gray-400 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.firstName ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 400
                            }}
                        />
                        {hasSubmitted && errors.firstName && (
                            <p className="absolute top-full right-0 text-sm text-red-600 z-20">{errors.firstName}</p>
                        )}
                    </div>

                    {/* Last Name Field */}
                    <div className="relative">
                        <label htmlFor="lastName" className="block text-sans text-base text-black font-light">
                            last name
                        </label>
                        <input 
                            type="text" 
                            name="lastName" 
                            id="lastName" 
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="streep"
                            disabled={showLoading}
                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black placeholder-gray-400 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.lastName ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 400
                            }}
                        />
                        {hasSubmitted && errors.lastName && (
                            <p className="absolute top-full right-0 text-sm text-red-600 z-20">{errors.lastName}</p>
                        )}
                    </div>

                    {/* Category Field */}
                    <div className="relative">
                        <label htmlFor="category" className="block text-sans text-base text-black font-light">
                            category
                        </label>
                        <select 
                            name="category" 
                            id="category" 
                            value={formData.category}
                            onChange={handleInputChange}
                            disabled={showLoading}
                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.category ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 400
                            }}
                        >
                            <option value="">select category</option>
                            <option value="family">family</option>
                            <option value="friends">friends</option>
                            <option value="work">work</option>
                            <option value="business">business</option>
                            <option value="other">other</option>
                        </select>
                        {hasSubmitted && errors.category && (
                            <p className="absolute top-full right-0 text-sm text-red-600 z-20">{errors.category}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="relative">
                        <label htmlFor="email" className="block text-sans text-base text-black font-light">
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
                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black placeholder-gray-400 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.email ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 400
                            }}
                        />
                        {hasSubmitted && errors.email && (
                            <p className="absolute top-full right-0 text-sm text-red-600 z-20">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div className="relative">
                        <label htmlFor="phone" className="block text-sans text-base text-black font-light">
                            phone
                        </label>
                        <input 
                            type="tel" 
                            name="phone" 
                            id="phone" 
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 123-4567"
                            disabled={showLoading}
                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black placeholder-gray-400 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.phone ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 400
                            }}
                        />
                        {hasSubmitted && errors.phone && (
                            <p className="absolute top-full right-0 text-sm text-red-600 z-20">{errors.phone}</p>
                        )}
                    </div>

                    {/* Birthdate Toggle and Field */}
                    <div className="relative">
                        {!showBirthdate ? (
                            <button
                                type="button"
                                onClick={() => setShowBirthdate(true)}
                                className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-light"
                                disabled={showLoading}
                            >
                                <span className="text-lg">+</span>
                                <span className="text-base">add birthdate</span>
                            </button>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="birthdate" className="block text-sans text-base text-black font-light">
                                        birthdate
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowBirthdate(false);
                                            setFormData(prev => ({ ...prev, birthdate: '' }));
                                        }}
                                        className="text-gray-500 hover:text-red-500 transition-colors duration-200 text-sm"
                                        disabled={showLoading}
                                    >
                                        remove
                                    </button>
                                </div>
                                <input 
                                    type="date" 
                                    name="birthdate" 
                                    id="birthdate" 
                                    value={formData.birthdate}
                                    onChange={handleInputChange}
                                    disabled={showLoading}
                                    className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black placeholder-gray-400 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                        hasSubmitted && errors.birthdate ? 'border-red-400' : ''
                                    }`}
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 400
                                    }}
                                />
                                {hasSubmitted && errors.birthdate && (
                                    <p className="absolute top-full right-0 text-sm text-red-600 z-20">{errors.birthdate}</p>
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
                                <span className="text-lg">+</span>
                                <span className="text-base">add address</span>
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sans text-base text-black font-light">
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
                                        className="text-gray-500 hover:text-red-500 transition-colors duration-200 text-sm"
                                        disabled={showLoading}
                                    >
                                        remove
                                    </button>
                                </div>
                                
                                {/* Address Field */}
                                <div className="relative">
                                    <label htmlFor="address" className="block text-sans text-base text-black font-light">
                                        street address, nr°
                                    </label>
                                    <input 
                                        type="text" 
                                        name="address" 
                                        id="address" 
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="greifwalder Str. 8"
                                        disabled={showLoading}
                                        className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black placeholder-gray-400 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                            hasSubmitted && errors.address ? 'border-red-400' : ''
                                        }`}
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: 400
                                        }}
                                    />
                                    {hasSubmitted && errors.address && (
                                        <p className="absolute top-full right-0 text-sm text-red-600 z-20">{errors.address}</p>
                                    )}
                                </div>

                                {/* Postal Code and City in a row */}
                                <div className="flex space-x-4">
                                    <div className="relative flex-1">
                                        <label htmlFor="postalcode" className="block text-sans text-base text-black font-light">
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
                                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black placeholder-gray-400 transition-all duration-200 max-w-full min-w-[100px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                                hasSubmitted && errors.postalcode ? 'border-red-400' : ''
                                            }`}
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: 400
                                            }}
                                        />
                                        {hasSubmitted && errors.postalcode && (
                                            <p className="absolute top-full right-0 text-sm text-red-600 z-20">{errors.postalcode}</p>
                                        )}
                                    </div>

                                    <div className="relative flex-1">
                                        <label htmlFor="city" className="block text-sans text-base text-black font-light">
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
                                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black placeholder-gray-400 transition-all duration-200 max-w-full min-w-[100px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                                hasSubmitted && errors.city ? 'border-red-400' : ''
                                            }`}
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: 400
                                            }}
                                        />
                                        {hasSubmitted && errors.city && (
                                            <p className="absolute top-full right-0 text-sm text-red-600 z-20">{errors.city}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Country Field */}
                                <div className="relative">
                                    <label htmlFor="country" className="block text-sans text-base text-black font-light">
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
                                        className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black placeholder-gray-400 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                            hasSubmitted && errors.country ? 'border-red-400' : ''
                                        }`}
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: 400
                                        }}
                                    />
                                    {hasSubmitted && errors.country && (
                                        <p className="absolute top-full right-0 text-sm text-red-600 z-20">{errors.country}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes Field */}
                    <div className="relative">
                        <label htmlFor="notes" className="block text-sans text-base text-black font-light">
                            notes
                        </label>
                        <textarea 
                            name="notes" 
                            id="notes" 
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="additional notes..."
                            disabled={showLoading}
                            rows={3}
                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black placeholder-gray-400 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 resize-none ${
                                hasSubmitted && errors.notes ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 400
                            }}
                        />
                        {hasSubmitted && errors.notes && (
                            <p className="absolute top-full right-0 text-sm text-red-600 z-20">{errors.notes}</p>
                        )}
                    </div>

                    {/* Favorite Checkbox */}
                    <div className={`flex items-start space-x-3 relative mt-8 p-1 rounded-lg`}>
                        <input 
                            id="isFavorite" 
                            type="checkbox" 
                            name="isFavorite"
                            checked={formData.isFavorite}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded mt-1 border-2 border-black-300 focus:ring-0 focus:ring-offset-0"
                            style={{ 
                                accentColor: 'black',
                                backgroundColor: formData.isFavorite ? 'black' : 'transparent',
                                borderColor: formData.isFavorite ? 'black' : '#d1d5db'
                            }}
                        />
                        <label htmlFor="isFavorite" className="text-sm font-light text-black dark:text-black mt-0.5 cursor-pointer">
                            mark as favorite contact
                        </label>
                    </div>
                </div>

                {/* Circle Button - Outside the space-y-6 div but inside the card */}
                <CircleButton
                    size="large"
                    variant="dark"
                    className="border border-white/30 absolute -bottom-[60px] -right-[30px]"
                    style={{ 
                        marginTop: '2rem', 
                        marginLeft: 'auto', 
                        display: 'block' 
                    }}
                    disabled={showLoading}
                    onClick={handleSubmit}>
                    {showLoading ? '. . .' : 'create.'}
                </CircleButton>
            
            </div>

            {/* Back Link */}
            <div className="text-black dark:text-white font-light block mt-2 absolute left-[40px]"
                 style={{ fontSize: '16px' }}>
                want to go back? {' '}
                <button 
                    onClick={() => {
                        if (onCancel) {
                            onCancel();
                        } else {
                            navigate('/contacts');
                        }
                    }}
                    className="font-light font-normal text-red-500 hover:underline bg-transparent border-none cursor-pointer"
                >
                     all contacts.
                </button>
            </div>
        </div>
    );
};

export default ContactForm;