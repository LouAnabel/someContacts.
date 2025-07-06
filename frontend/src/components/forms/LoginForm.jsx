import { useState } from 'react';
import CircleButton from '../ui/Buttons';
import { useNavigate } from 'react-router-dom';


const LoginForm = ({ onSubmit, isLoading = false }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    

    // Api function call
    const loginUser = async (loginData) => {
        const navigate = useNavigate();
        try {
            setApiLoading(true);

            // Simulate API call & replace with actual API logic
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: loginData.email,
                    password: loginData.password
                })
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Login successful:', data);

                if (data.token) {
                    // Store token in localStorage or context
                    localStorage.setItem('authToken', data.token);
                }

                // Store user data in localStorage or context   
                localStorage.setItem('userData', JSON.stringify(data.user));
                

                // clear any previous errors & clear form data
                setErrors({});
                setFormData({
                    email: '',
                    password: ''
                });

                alert('Login successful! Check console for form data.');
                // Redirect to contacts page    
                navigate('/');
            

            } else {
                // Error case - backend validation failed
                console.error('Login failed:', data);

                // set error message to display on the form
                setErrors({
                    submit: data.message || 'Login failed. Please try again.'
                });
            }

        } catch (error) {
            // Network error
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setHasSubmitted(true); // Mark that form has been submitted
        
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
        <div className="min-h-screen bg-white dark:bg-black p-6 absolute top-[180px]" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Login Card */}
            <div className="bg-gray-50 rounded-3xl p-6 relative z-10 overflow-visible w-[75vw] min-w-[260px] max-w-[480px] h-fit absolute left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(0, 0, 0, 0.3)'
                 }}>
                
                <h2 className="text-3xl font-bold text-center mb-7 text-black">login.</h2>

                <div className="mb-5 relative">
                    <label htmlFor="email" className="relative left-2 block text-sans text-md text-black font-light">
                            email
                        </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className={`w-full p-2.5 rounded-xl border bg-transparent text-black border-gray-500 placeholder-gray-300 transition-all duration-200 max-w-full min-w-[200px] focus:outline-none focus:border-red-500 ${
                            errors.password ? 'border-red-400' : ''
                        }`}
                        style={{
                            fontSize: '16px',
                            fontWeight: 400
                        }}
                    />
                    {hasSubmitted && errors.email && (
                        <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.email}</p>
                    )}
                </div>

                <div className="mb-7 relative ">
                    <label htmlFor="password" className="relative left-2 block text-sans text-md text-black font-light">
                            password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={`w-full p-2.5 rounded-xl border bg-transparent text-black border-gray-500 placeholder-gray-300 transition-all duration-200 max-w-full min-w-[200px] focus:outline-none focus:border-red-500 ${
                            errors.password ? 'border-red-400' : ''
                        }`}
                        style={{
                            fontSize: '16px',
                            fontWeight: 400
                        }}
                    />
                    {hasSubmitted && errors.password && (
                        <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.password}</p>
                    )}
                </div>

                {errors.submit && (
                    <div className="mt-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg">
                        {errors.submit}
                    </div>
                )}

                {/* Signup Link */}
                <div className= "text-black dark:text-white font-light block absolute bottom-[-30px] left-[30px]"
                     style={{ fontSize: '16px' }}>
                    no account? {' '}
                            <a href="register" className="font-light font-normal text-red-500 hover:underline">
                                sign in here
                            </a>
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

export default LoginForm;