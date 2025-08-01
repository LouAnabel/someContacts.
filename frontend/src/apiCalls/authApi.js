
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
        console.log("fetched user data:", userData);
        console.log(userData.user)
        return userData.user || {};
    }   

    catch (error) {
        console.log('Error fetching user Data:', error);
        throw error;
    }
}    