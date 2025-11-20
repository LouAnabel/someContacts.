

// Get the appropriate backend URL based on environment
const getBackendUrl = () => {
    // In development, use local backend URL
    if (import.meta.env.DEV || import.meta.env.VITE_LOCAL_BACKEND_URL) {
        return import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://127.0.0.1:5000';
    }
    // In production, use production backend URL
    return import.meta.env.VITE_BACKEND_URL;
};

const BACKEND_URL = getBackendUrl();

//Helper Functions for Auth API Calls
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
    }
    return await response.json();
};


// Helper Function Validation
// Validate email format
export function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}


// Validate password strength
export function validatePassword(password) {
    if (password.length < 6) {
        return { isValid: false, error: "Password must be at least 6 characters" };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, error: "Password must contain an uppercase letter" };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, error: "Password must contain a lowercase letter" };
    }
    if (!/\d/.test(password)) {
        return { isValid: false, error: "Password must contain a number" };
    }
    return { isValid: true, error: "" };
}


//Register User API Call
export async function sendRegisterData(registerData) {
    console.log("In AUTH FILE: Register Data to send:", registerData);
    try {
        const response = await fetch(`${BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                    first_name: registerData.first_name,
                    last_name: registerData.last_name,
                    email: registerData.email,
                    password: registerData.password
            })
        });

        const data = await handleResponse(response);
        console.log("In AUTH FILE: Put User Data:", data);
        return data || {};
    } catch (error) {
        console.log('In AUTH FILE: Error fetching user Data:', error);
        throw error;
    }
}


// Login User API Call
export async function sendLoginData(loginData) {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: loginData.email,
                password: loginData.password
            })
        });
        
        const data = await handleResponse(response);
        console.log("In AUTH FILE: Login User Data:", data);
        return data || {};
    } catch (error) {
        console.log('In AUTH FILE: Error fetching user Data:', error);
        throw error;
    }
}


// Get current user data
// Authenticate Me
export async function authMe(token) {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }    
        });

        const data = await handleResponse(response);
        console.log("In AUTH FILE: Fetching and sending userData");
        return data.user || {};
    } catch (error) {
        console.error('In AUTH FILE: Error fetching user data:', error);
        throw error;
    }
}

//Update User Data
export async function updateUserData(token, userData) {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        
        const data = await handleResponse(response);
        console.log("In AUTH FILE: User data updated successfully");
        return data;
    } catch (error) {
        console.error('In AUTH FILE: Error updating user data:', error);
        throw error;
    }
}



// Refresh access token using refresh token
export async function refreshToken(refreshToken) {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`
            }
        });
        
        const data = await handleResponse(response);
        console.log("In AUTH FILE: Token refreshed successfully");
        return data;
    } catch (error) {
        console.error('In AUTH FILE: Error refreshing token:', error);
        throw error;
    }
}


// Logout User API Call
export async function logoutUser(token) {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await handleResponse(response);
        console.log("In AUTH FILE: User logged out successfully");
        return data;
    } catch (error) {
        console.error('In AUTH FILE: Error logging out user:', error);
        throw error;
    }
}


//Logout from all devices API Call
export async function logoutAllDevices(token) {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/logout-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await handleResponse(response);
        console.log("In AUTH FILE: User logged out from all devices");
        return data;
    } catch (error) {
        console.error('In AUTH FILE: Error logging out from all devices:', error);
        throw error;
    }
}


// Export all functions
export default {
    sendRegisterData,
    sendLoginData,
    authMe,
    refreshToken,
    logoutUser,
    logoutAllDevices,
    updateUserData,
    validateEmail,
    validatePassword
};