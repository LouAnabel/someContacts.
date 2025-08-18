import React, { useState, useEffect } from 'react';
import CircleButton from '../ui/Buttons';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    // / Reset form on component mount/refresh
    useEffect(() => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        setErrors({});
        setHasSubmitted(false);
        setAcceptTerms(false);
        setApiLoading(false);
    }, []);
  

    // API call
    const registerUser = async (registerData) => {
        try {
            setApiLoading(true);
            
            
            const response = await fetch('http://127.0.0.1:5000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: registerData.firstName,
                    last_name: registerData.lastName,
                    email: registerData.email,
                    password: registerData.password
                })
            });

            const data = await response.json();
            
            console.log('API Response Status:', response.status);
            console.log('API Response Data:', data);

            if (response.ok) {
                console.log('Registration successful:', data);
            
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }

                if (data.user) {
                    localStorage.setItem('userData', JSON.stringify(data.user));    
                }

                setErrors({});
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });

                setAcceptTerms(false);
                setHasSubmitted(false);
                
                alert('Registration successful! Check console for form data.');
                navigate('/login');

            } else {
                console.error('Registration failed:', data);
                setErrors({
                    submit: data.message || 'Registration failed. Please try again.'
                });
            }
        
            
        } catch (error) {
            console.error('Network/API error:', error);
            setErrors({
                submit: 'Unable to connect to server. Please try again later.'
            });
        } finally {
            setApiLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Only clear errors if user has already submitted once
        if (hasSubmitted && errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (errors.submit) {
            setErrors(prev => ({ ...prev, submit: '' }));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }


    const handleTermsChange = (e) => {
        setAcceptTerms(e.target.checked);
        
        // Clear terms error immediately when checkbox is checked
        if (e.target.checked && errors.terms) {
            setErrors(prev => ({ ...prev, terms: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // first name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }
        
        // last name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }
        
        // email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        // password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Password must contain an uppercase letter';
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = 'Password must contain a lowercase letter';
        } else if (!/\d/.test(formData.password)) {
            newErrors.password = 'Password must contain a number';
        }

        // confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setHasSubmitted(true);
        
        if (!validateForm()) {
            setApiLoading(false);
            console.error('Form validation failed:', errors);
            return;
        }
        
        await registerUser(formData);
    };

    const showLoading = apiLoading;

    return (
        <div className="justify-items items-center min-h-screen bg-white dark:bg-gray-900 p-5 absolute top-[120px]" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Register Card */}
            <div className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] "
                 style={{ 
                     boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
                 }}>
                <h1 className="text-3xl font-bold mt-2 mb-10 text-center text-black">
                    create an account.
                </h1>

                {/* Form Element - This is the key addition! */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-3 mb-14">
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
                                    disabled={showLoading}
                                    className={`w-full rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                        hasSubmitted && errors.firstName ? 'border-red-500 shadow-md' : 'border-gray-400 dark:border-gray-400'
                                    }`}
                                    style={{
                                        fontSize: '18px',
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
                                    <p className="absolute font-extralight top-full right-1 text-sm text-red-600 z-20">{errors.firstName}</p>
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
                                    className={`w-full rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                        hasSubmitted && errors.lastName ? 'border-red-500 shadow-md' : 'border-gray-400 dark:border-gray-400'
                                    }`}
                                    style={{
                                        fontSize: '18px',
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
                                    <p className="absolute top-full font-light right-1 text-sm text-red-600 z-20">{errors.lastName}</p>
                                )}
                            </div>
                        </div>

                        
                            
                        <p className="relative text-red-500 left-2 tracking-wide font-extralight pt-6 ">how to login?</p>
                        {/* Email Field */}
                        <div className="space-y-5">
                            <div className="relative">
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="your@email.com"
                                    disabled={showLoading}
                                    className={`w-full rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                        hasSubmitted && errors.email ? 'border-red-500 shadow-md' : 'border-gray-400 dark:border-gray-400'
                                    }`}
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: 200
                                    }}
                                />
                                <label 
                                    htmlFor="email" 
                                    className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
                                >
                                    email
                                </label>
                                {hasSubmitted && errors.email && (
                                    <p className="absolute top-full font-extralight right-1 text-sm text-red-600 z-20">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="relative">
                                <label 
                                    htmlFor="password" 
                                    className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
                                >
                                    password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className={`w-full rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                                hasSubmitted && errors.password ? 'border-red-500 shadow-md' : 'border-gray-400 dark:border-gray-400'
                                    }`}
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: 200
                                    }}
                                />
                                <button 
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 end-0 mt-1 flex items-center z-20 px-3 cursor-pointer text-gray-400 hover:text-red-500 rounded-e-md focus:outline-hidden focus:text-red-500 dark:text-neutral-600 dark:focus:text-red-500">
                                
                                    <svg className="shrink-0 size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {showPassword ? (
                                            <>
                                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </>
                                        ) : (
                                            // Eye closed (password hidden)
                                            <>
                                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                                <line x1="2" x2="22" y1="2" y2="22"></line>
                                            </>
                                        )}
                                    </svg>
                                </button>
                                
                                {hasSubmitted && errors.password && (
                                    <p className="absolute top-full font-extralight right-1 text-sm text-red-600 z-20">{errors.password}</p>
                                )}
                            </div>

        
                            {/* Confirm Password Field */}
                            <div className="relative">
                                <label 
                                    htmlFor="confirmPassword" 
                                    className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
                                >
                                    confirm password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className={`w-full rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
                                                hasSubmitted && errors.confirmPassword ? 'border-red-500 shadow-md' : 'border-gray-400 dark:border-gray-400'
                                    }`}
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: 200
                                    }}
                                />
                                
                                {hasSubmitted && errors.confirmPassword && (
                                    <p className="absolute top-full font-extralight right-1 text-sm text-red-600 z-20">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {/* Login Error Message */}
                        {errors.submit && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600 text-center font-extralight">{errors.submit}</p>
                            </div>
                        )}

                        {/* Terms and Conditions
                        <div className={`flex items-start space-x-3 relative p-1 rounded-lg ${hasSubmitted && errors.terms ? 'ring-2 ring-red-500' : ''}`}>
                            <input 
                                id="terms" 
                                type="checkbox" 
                                checked={acceptTerms}
                                onChange={handleTermsChange}
                                className="w-4 h-4 rounded mt-1 border-2 border-black-300 focus:ring-0 focus:ring-offset-0"
                                style={{ 
                                    accentColor: 'black',
                                    backgroundColor: acceptTerms ? 'black' : 'transparent',
                                    borderColor: acceptTerms ? 'black' : '#d1d5db'
                                }}
                            />
                            <label htmlFor="terms" className="text-sm font-extralight text-black dark:text-black mt-0.5 cursor-pointer">
                                I accept the{' '}
                                <a href="#" className="font-medium text-red-500 hover:underline">
                                    terms and conditions.
                                </a>
                            </label>
                        </div> */}
                    </div>

                    {/* Hidden submit button for Enter key functionality */}
                    <button 
                        type="submit" 
                        style={{ display: 'none' }}
                        disabled={showLoading}
                    />
                </form>

                {/* Circle Button - Outside the form but inside the card */}
                <CircleButton
                    size="xl"
                    variant="dark"
                    className=" absolute font-semibold -bottom-[85px] -right-[10px]"
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

            {/* Signup Link */}
            <div className="w-full px-8 mt-2 space-y-0.25 max-w-[480px]">
                <div className="text-black dark:text-white font-extralight block relative"
                    style={{ fontSize: '16px' }}>
                    already registered? {' '}
                    <a href="login" className="font-light text-red-500 hover:underline">
                        login.
                    </a>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;