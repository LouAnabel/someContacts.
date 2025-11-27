import { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react'

const AuthContext = createContext()

function AuthContextProvider({ children }) {
    const [userData, setUserData] = useState(undefined)
    const [accessToken, setAccessToken] = useState(undefined)
    const [refreshToken, setRefreshToken] = useState(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const localUser = JSON.parse(localStorage.getItem('userData'))
        const localAccessToken = localStorage.getItem('accessToken')
        const localRefreshToken = localStorage.getItem('refreshToken')

        // Simple check: if no tokens, logout
        if (!localAccessToken && !localRefreshToken) {
            logout();
        } else if (!localRefreshToken) {
            logout();
        } else {
            // Tokens exist, set them
            if (localUser) setUserData(localUser);
            if (localAccessToken) setAccessToken(localAccessToken);
            if (localRefreshToken) setRefreshToken(localRefreshToken);
        }

        setIsLoading(false)
    }, [])

    const login = useCallback((accessTokenValue, user, refreshTokenValue) => {
        localStorage.setItem('accessToken', accessTokenValue)
        localStorage.setItem('userData', JSON.stringify(user))
        localStorage.setItem('refreshToken', refreshTokenValue)

        setAccessToken(accessTokenValue)
        setUserData(user)
        setRefreshToken(refreshTokenValue)
        
        console.log("Login successful - userData:", user)
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userData')

        setAccessToken(undefined)
        setRefreshToken(undefined)
        setUserData(undefined)
    }, [])


    const authFetch = useCallback(async (url, options = {}) => {
        
        let token = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        let res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (res.status !== 401) return res;
        
        console.log("Access Expired!")

        // 2) Try refresh
        if (!storedRefreshToken) {
            logout();
            throw new Error('No refresh token');
        }

        console.log("refreshing AccessToken")
        
        // Get fresh userData from localStorage instead of stale state
        const storedUserData = JSON.parse(localStorage.getItem('userData'));
        console.log("passing userData for refresh:", storedUserData)

        const refreshRes = await fetch('http://127.0.0.1:5000/auth/refresh', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                Authorization: `Bearer ${storedRefreshToken}` 
            },
        });

        if (!refreshRes.ok) {
            console.log("Refresh Expired!")
            logout();
            window.location.href = "http://localhost:5173/login"
            throw new Error('Refresh failed');
        }

        const data = await refreshRes.json();

        const newAccessToken = data.access_token;

        // Use stored userData instead of stale state
        login(newAccessToken, storedUserData, storedRefreshToken)

        // 3) Retry original request with fresh token
        res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
                Authorization: `Bearer ${newAccessToken}`,
            },
        });

        if (res.status === 401) {
            logout();
            throw new Error('Unauthorized after refresh');
        }

        return res;
    }, [login, logout]);

    const contextValue = useMemo(() => ({
        userData,
        accessToken,
        refreshToken,
        authFetch,
        isLoading,
        login,
        logout,
    }), [userData, accessToken, refreshToken, authFetch, isLoading, login, logout]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider
export const useAuthContext = () => useContext(AuthContext)