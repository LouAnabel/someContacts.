import React, { useState, useRef } from 'react';
import LoginForm from '../components/forms/LoginForm'; 

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const loginFormRef = useRef(null);

    const handleLogin = async (formData) => {
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log('Login data:', {
                email: formData.email,
                password: formData.password,
                remember: formData.remember
            });
            
            // Here you would typically:
            // 1. Make an API call to your authentication endpoint
            // 2. Store the auth token in localStorage or context
            // 3. Redirect the user to the dashboard
            
            alert('Login successful! Check console for form data.');
            
        } catch (error) {
            // Handle login error
            console.error('Login error:', error);
            
            // Set error message on the form
            if (loginFormRef.current) {
                loginFormRef.current.setSubmitError('Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                {/* Login Form Component */}
                <LoginForm 
                    ref={loginFormRef}
                    onSubmit={handleLogin}
                    isLoading={isLoading}
                />
            </div>
        </section>
    );
};

export default Login;