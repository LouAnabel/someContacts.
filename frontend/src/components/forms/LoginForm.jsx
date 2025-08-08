import { useState } from 'react';
import CircleButton from '../ui/Buttons';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContextProvider';
import { sendLoginData } from '../../apiCalls/authApi';

const LoginForm = ({ onSubmit, isLoading = false }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuthContext();
    
    const navigate = useNavigate();

    // Api function call
    const loginUser = async (loginData) => {
        try {
            setApiLoading(true);

            // call API call
            const data = await sendLoginData(loginData);

            if (data && data.access_token) {
                login(data.access_token, data.user)
                console.log("Login successfull!")

                // clear any previous errors & clear form data
                setErrors({});
                setFormData({
                    email: '',
                    password: ''
                });

                // Redirect to contacts page    
                navigate('/myspace/', { replace: true });
            }  else {
            
                // Error case - backend validation failed
                console.error('Login failed:', data);

                // set error message to display on the form
                setErrors({
                    submit: data.message || 'Login failed. Please try again.'
                });
            }

        } catch (error) {
            console.error('Login error:', error);
            
            // Handle different types of errors
            if (error.status >= 400 && error.status < 500) {
                // Client errors (401, 400, etc.) - usually authentication failures
                setErrors({
                    submit: 'Invalid email or password.'
                });
            } else if (error.status >= 500) {
                // Server errors
                setErrors({
                    submit: 'Server error. Please try again later.'
                });
            } else {
                // Network or other errors
                setErrors({
                    submit: 'Unable to connect to server. Please check your connection.'
                });
            }
        } finally {
            setApiLoading(false);
        }
    };    

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

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
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
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
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setHasSubmitted(true);
        
        // Validate form before submitting
        if (!validateForm()) {
            console.error('Form validation failed:', errors);
            return;
        }

        // Form is valid, proceed with API call
        console.log('Submitting form with data:', formData);
        await loginUser(formData);

        if (onSubmit) {
            onSubmit(formData);
        }
    };

    const showLoading = isLoading || apiLoading;

    return (
        <div className="justify-items items-center bg-white dark:bg-black p-5 absolute top-[120px]" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Register Card */}
            <div className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px]"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
                 }}>
                <h1 className="text-3xl mt-2 font-bold text-center mb-8 text-black">
                    login.
                </h1>

                {/* Form Element - This is the key addition! */}
                <form onSubmit={handleSubmit}>
                    {/* Input Fields */}
                    <div className="space-y-6 mb-14">
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your@email.com"
                                className={`w-full rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
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
                                <p className="absolute top-full right-1 font-extralight text-sm text-red-600 z-20">{errors.email}</p>
                            )}
                        </div>

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
                                className={`w-full rounded-xl border bg-white -mb-e hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500 ${
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
                                <p className="absolute top-full right-1 font-extralight text-sm text-red-600 z-20">{errors.password}</p>
                            )}
                        </div>

                        {/* Login Error Message */}
                        {errors.submit && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600 text-center font-light">{errors.submit}</p>
                            </div>
                        )}

                    </div>

                    {/* Hidden submit button for Enter key functionality */}
                    <button 
                        type="submit" 
                        style={{ display: 'none' }}
                        disabled={showLoading}
                    />
                </form>
                
                {/* Circle Button */}
                <CircleButton
                    size="xl"
                    variant="dark"
                    className="absolute font-semibold -bottom-[85px] -right-[10px]"
                    style={{ 
                        marginTop: '2rem', 
                        marginLeft: 'auto', 
                        display: 'block' 
                    }}
                    disabled={showLoading}
                    onClick={handleSubmit}>
                    {showLoading ? '. . .' : 'get in.'}
                </CircleButton>
            </div>
            {/* Signup Link */}
            <div className="w-full px-8 mt-2 space-y-0.25 max-w-[480px]">
                <div className="font-extralight text-black dark:text-white block relative"
                    style={{ fontSize: '16px' }}>
                    no account? {' '}
                    <a href="register" className="font-light text-red-500 hover:underline">
                        sign up.
                    </a>
                </div>
            </div> 
        </div>
    );
};

export default LoginForm;