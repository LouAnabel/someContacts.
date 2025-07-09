import React, { useState } from 'react';
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

    // Api function call - TEMPORARILY DISABLED FOR TESTING
    const registerUser = async (registerData) => {
        try {
            setApiLoading(true);
            
            // =================
            // DEBUG MODE: Skip API call, just log the data
            // =================
            console.log('=== FORM DATA THAT WOULD BE SENT TO API ===');
            console.log('Registration Data:', {
                firstName: registerData.firstName,
                lastName: registerData.lastName,
                email: registerData.email,
                password: ['HIDDEN']
            });
            console.log('Raw Form Data:', registerData);
            console.log('Accept Terms:', acceptTerms);
            console.log('============================================');
            
        
            // ========================================
            // COMMENTED OUT: ACTUAL API CALL
            // ========================================
            
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
                
                alert('Registration successful! Check console for form data.');
                navigate('/hello/login');

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
        }

        // confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // terms and conditions validation
        if (!acceptTerms) {
            newErrors.terms = 'You must accept the terms and conditions';
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
        
        // Form is valid, proceed with "API call" (debug mode)
        console.log('✅ Form validation passed, proceeding with submission...');
        
        await registerUser(formData);
    };

    const showLoading = apiLoading;

    return (
        <div className="min-h-screen bg-white dark:bg-black p-6 absolute top-[90px]" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Register Card */}
            <div className="bg-gray-50 rounded-3xl p-6 relative z-10 overflow-visible w-[75vw] min-w-[260px] max-w-[480px] h-fit absolute left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(0, 0, 0, 0.3)'
                 }}>
                <h1 className="text-3xl font-bold text-center mb-7 text-black">
                    create an account.
                </h1>

                <div className="space-y-5">
                    {/* First Name Field */}
                    <div className="relative">
                        <label htmlFor="firstName" className="relative left-2  block font-text text-md text-black font-light ">
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
                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black font-light placeholder-gray-300 max-w-full min-w-[200px] focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.firstName ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 300
                            }}
                        />
                        {hasSubmitted && errors.firstName && (
                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.firstName}</p>
                        )}
                    </div>

                    {/* Last Name Field */}
                    <div className="relative">
                        <label htmlFor="lastName" className="relative left-2  block text-sans text-md text-black font-light">
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
                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black font-light placeholder-gray-300 max-w-full min-w-[200px] focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.firstName ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 300
                            }}
                        />
                        {hasSubmitted && errors.lastName && (
                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.lastName}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="relative">
                        <label htmlFor="email" className="relative left-2  block text-sans text-md text-black font-light">
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
                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black font-light placeholder-gray-300 max-w-full min-w-[200px] focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.firstName ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 300
                            }}
                        />
                        {hasSubmitted && errors.email && (
                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                        <label htmlFor="password" className="relative left-2 block text-sans text-md text-black font-light">
                            password
                        </label>
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            disabled={showLoading}
                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black font-light placeholder-gray-300 max-w-full min-w-[200px] focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.firstName ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 300
                            }}
                        />
                        {hasSubmitted && errors.password && (
                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="relative">
                        <label htmlFor="confirmPassword" className="relative left-2  block text-md text-black font-light">
                            confirm password
                        </label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            id="confirmPassword" 
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            disabled={showLoading}
                            className={`w-full p-2.5 rounded-xl border border-gray-500 bg-transparent text-black font-light placeholder-gray-300 max-w-full min-w-[200px] focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.firstName ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 300
                            }}
                        />
                        {hasSubmitted && errors.confirmPassword && (
                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    <div className={`flex items-start space-x-3 relative mt-8 p-1 rounded-lg ${hasSubmitted && errors.terms ? 'ring-2 ring-red-500' : ''}`}>
                        <input 
                            id="terms" 
                            type="checkbox" 
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="w-4 h-4 rounded mt-1 border-2 border-black-300 focus:ring-0 focus:ring-offset-0"
                            style={{ 
                                accentColor: 'black',
                                backgroundColor: acceptTerms ? 'black' : 'transparent',
                                borderColor: acceptTerms ? 'black' : '#d1d5db'
                            }}
                        />
                        <label htmlFor="terms" className="text-sm font-light text-black dark:text-black mt-0.5 cursor-pointer">
                            I accept the{' '}
                            <a href="#" className="font-medium text-red-500 hover:underline">
                                terms and conditions.
                            </a>
                        </label>
                    </div>
                </div>

                {/* Circle Button - Outside the space-y-6 div but inside the card */}
                <CircleButton
                    size="large"
                    variant="dark"
                    className="dark:bg-red-600 hover:dark:bg-black hover:dark:border hover:dark:border-white absolute -bottom-[60px] -right-[30px]"
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
            <div className="text-black dark:text-white font-light block mt-2 absolute left-[40px]"
                 style={{ fontSize: '16px' }}>
                already have an account? {' '}
                <a href="login" className="font-light font-normal text-red-500 hover:underline">
                     login here.
                </a>
            </div>
        </div>
    )};
    
export default RegisterForm;