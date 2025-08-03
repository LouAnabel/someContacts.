// Login User API Call
export async function sendLoginData(loginData) {
    try {
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
        
        if (!response.ok) {
            // Extract error message from response body
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }
        
        const data = await response.json();
        console.log("In AUTH FILE: Put User Data:", data);
        return data || {};
    } catch (error) {
        console.log('In AUTH FILE: Error fetching user Data:', error);
        throw error;
    }
}



// Authenticate Me
export async function authMe(token) {
    try {
        const response = await fetch("http://127.0.0.1:5000/auth/me", {
            method : 'GET',
            headers : {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }    
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const userData = await response.json();
        console.log("In AUTH FILE: fetched data:", userData);
        console.log("In AUTH FILE: send only userData:", userData.user)
        return userData.user || {};
    }   

    catch (error) {
        console.log('Error fetching user Data:', error);
        throw error;
    }
}    