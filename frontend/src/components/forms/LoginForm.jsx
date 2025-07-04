import React, { useState } from 'react';
import CircleButton from '../ui/Buttons';

const ContactsLogin = ({ onSubmit, isLoading = false }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);

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
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setHasSubmitted(true); // Mark that form has been submitted
        
        if (!validateForm()) return;
        
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black p-6 absolute top-[180px]" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Login Card */}
            <div className="bg-gray-100 rounded-3xl p-6 relative z-10 overflow-visible w-[75vw] min-w-[260px] max-w-[480px] h-fit absolute  left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(0, 0, 0, 0.3)'
                 }}>
                
                <h2 className="text-3xl font-bold text-center mb-8 text-black">Login.</h2>

                <div className="mb-8 relative">
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email"
                        className={`w-full p-2.5 rounded-xl border border-black bg-transparent text-black placeholder-gray-500 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                            errors.email ? 'border-red-400' : ''
                        }`}
                        style={{
                            fontSize: '16px',
                            fontWeight: 400
                        }}
                    />
                    {hasSubmitted && errors.email && (
                        <p className="absolute top-full left-0 mt-2 text-sm text-red-600 z-20">{errors.email}</p>
                    )}
                </div>

                <div className="mb-8 relative">
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="password"
                        className={`w-full p-2.5 rounded-xl border border-black bg-transparent text-black placeholder-gray-500 transition-all duration-200 max-w-full min-w-[200px] text-base font-normal focus:outline-none focus:border-red-500 ${
                            errors.password ? 'border-red-400' : ''
                        }`}
                        style={{
                            fontSize: '16px',
                            fontWeight: 400
                        }}
                    />
                    {hasSubmitted && errors.password && (
                        <p className="absolute top-full left-0 mt-2 text-sm text-red-600 z-20">{errors.password}</p>
                    )}
                </div>

                {errors.submit && (
                    <div className="mt-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg">
                        {errors.submit}
                    </div>
                )}

                {/* Signup Link */}
                <div className="hover:text-red-500 text-black dark:text-white hover:dark:text-red-500 font-normal block absolute bottom-[-30px] left-[30px]"
                     style={{ fontSize: '16px' }}>
                    no account? sign in here.
                </div>

                {/* Circle Button */}
                <CircleButton
                    size="medium"
                    variant="dark"
                    className="border border-white/30 absolute -bottom-[60px] -right-[30px]"
                    style={{ 
                        marginTop: '2rem', 
                        marginLeft: 'auto', 
                        display: 'block' 
                    }}
                    disabled={isLoading}
                    onClick={handleSubmit}>
                    {isLoading ? '. . .' : 'get in.'}
                </CircleButton>
            </div>

            {/* Bottom Tagline */}
            <div className="text-center text-black dark:text-white text-l absolute left-1/2 transform -translate-x-1/2 w-full min-[480px]:text-base min-[480px]:bottom-[30%]"
                 style={{
                     fontWeight: 300,
                     lineHeight: 1.4,
                     fontSize: typeof window !== 'undefined' && window.innerWidth >= 1024 ? '30px' : '24px',
                               
                 }}>
                <p>Remember their names.</p>
                <p>Know their faces.</p>
            </div>
        </div>
    );
};

export default ContactsLogin;