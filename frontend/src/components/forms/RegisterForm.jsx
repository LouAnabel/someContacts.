import React, { useState } from 'react';
import CircleButton from '../ui/Buttons';

const RegisterForm = () => {
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
    const [isLoading, setIsLoading] = useState(false);

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
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!acceptTerms) {
            newErrors.terms = 'You must accept the terms and conditions';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setHasSubmitted(true);
        setIsLoading(true);
        
        if (!validateForm()) {
            setIsLoading(false);
            return;
        }
        
        // Simulate API call or actual registration
        setTimeout(() => {
            console.log('Registration data:', formData);
            setIsLoading(false);
            // Handle successful registration here
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black p-6 absolute top-[120px]" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Register Card */}
            <div className="bg-gray-100 rounded-3xl p-6 relative z-10 overflow-visible w-[75vw] min-w-[260px] max-w-[480px] h-fit absolute left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(0, 0, 0, 0.3)'
                 }}>
                <h1 className="text-3xl font-bold text-center mb-8 text-black">
                    create an account.
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
                            className={`w-full p-2.5 rounded-xl border border-black bg-transparent text-black placeholder-gray-500 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.firstName ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 400
                            }}
                        />
                        {hasSubmitted && errors.firstName && (
                            <p className="absolute top-full right-0 mt-1 text-sm text-red-600 z-20">{errors.firstName}</p>
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
                            className={`w-full p-2.5 rounded-xl border border-black bg-transparent text-black placeholder-gray-500 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.lastName ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 400
                            }}
                        />
                        {hasSubmitted && errors.lastName && (
                            <p className="absolute top-full right-0 mt-1 text-sm text-red-600 z-20">{errors.lastName}</p>
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
                            className={`w-full p-2.5 rounded-xl border border-black bg-transparent text-black placeholder-gray-500 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.email ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 400
                            }}
                        />
                        {hasSubmitted && errors.email && (
                            <p className="absolute top-full right-0 mt-1 text-sm text-red-600 z-20">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                        <label htmlFor="password" className="block text-sans text-base text-black font-light">
                            password
                        </label>
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className={`w-full p-2.5 rounded-xl border border-black bg-transparent text-black placeholder-gray-500 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.password ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 400
                            }}
                        />
                        {hasSubmitted && errors.password && (
                            <p className="absolute top-full right-0 mt-1 text-sm text-red-600 z-20">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="relative">
                        <label htmlFor="confirmPassword" className="block text-sans text-base text-black font-light">
                            confirm password
                        </label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            id="confirmPassword" 
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className={`w-full p-2.5 rounded-xl border border-black bg-transparent text-black placeholder-gray-500 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.confirmPassword ? 'border-red-400' : ''
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 400
                            }}
                        />
                        {hasSubmitted && errors.confirmPassword && (
                            <p className="absolute top-full right-0 mt-1 text-sm text-red-600 z-20">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-3 relative">
                        <input 
                            id="terms" 
                            type="checkbox" 
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="w-4 h-4 rounded cursor-pointer mt-1 hover:border-red-500 dark:hover:border-red-500 dark:checked:bg-black"
                            style={{ accentColor: 'black' }}
                        />
                        <label htmlFor="terms" className="text-sm font-light text-black dark:text-black mt-0.5 cursor-pointer">
                            I accept the{' '}
                            <a href="#" className="font-medium text-red-500 hover:underline">
                                terms and conditions.
                            </a>
                        </label>
                        {hasSubmitted && errors.terms && (
                            <p className="absolute top-full left-0 text-sm text-red-600 z-20">{errors.terms}</p>
                        )}
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
                    disabled={isLoading}
                    onClick={handleSubmit}>
                    {isLoading ? '. . .' : 'create.'}
                </CircleButton>
            </div>

            {/* Signup Link */}
                <div className=" text-black dark:text-white dark:text-white font-light block mt-2 absolute left-[40px]"
                     style={{ fontSize: '16px' }}>
                    already have an account? {' '}
                        <a href="login" className="font-light font-normal text-red-500 hover:underline">
                             login here.
                        </a>
                </div>

        </div>
    );
};

export default RegisterForm;