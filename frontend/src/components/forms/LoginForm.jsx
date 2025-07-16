import { useState } from 'react';
import CircleButton from '../ui/Buttons';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContextProvider';


const LoginForm = ({ onSubmit, isLoading = false }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    const { login } = useAuthContext();
    
    const navigate = useNavigate();

    // Api function call
    const loginUser = async (loginData) => {
        try {
            setApiLoading(true);

            // Simulate API call & replace with actual API logic
            const response = await fetch('http://127.0.0.1:5000/auth/login', {
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

                login(data.access_token, data.user)
                

                // clear any previous errors & clear form data
                setErrors({});
                setFormData({
                    email: '',
                    password: ''
                });

                // Redirect to contacts page    
                navigate('/myspace/', { replace: true });
            

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
        <div className="min-h-screen bg-white dark:bg-black absolute top-[180px]" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>

            {/* Main Login Card */}
            <div className="bg-white rounded-3xl p-5 pt-6 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] h-[280px] absolute left-1/2 transform -translate-x-1/2"
                 style={{ 
                     boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
                 }}>
                
                <h2 className="text-3xl font-bold text-center mb-9 text-black">login.</h2>
                <div className="space-y-7">
                    <div className="mb-4 relative">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your@email.com"
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
                            className="absolute -top-3 left-4 bg-white px-2 text-base text-black font-light"
                        >
                            email
                        </label>
                        {hasSubmitted && errors.email && (
                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.email}</p>
                        )}
                    </div>

                    <div className="mb-4 relative ">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
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
                            className="absolute -top-3 left-4 bg-white px-2 text-base text-black font-light"
                        >
                            password
                        </label>
                        {hasSubmitted && errors.password && (
                            <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.password}</p>
                        )}
                    </div>
                </div>    
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
                    size="xl"
                    variant="dark"
                    className="border border-white/30 absolute -bottom-[85px] -right-[10px]"
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

        </div>
    );
};

export default LoginForm;