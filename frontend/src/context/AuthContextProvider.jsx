import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react'
import { getBackendUrl } from '../apiCalls/authApi.js'

const AuthContext = createContext()
const BACKEND_URL = getBackendUrl();

function AuthContextProvider({ children }) {
    const [userData, setUserData] = useState(undefined)
    const [accessToken, setAccessToken] = useState(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const initialized = useRef(false); // Add this

    useEffect(() => {
        // Prevent double execution in Strict Mode
        if (initialized.current) return;
        initialized.current = true;

        let localUser = JSON.parse(localStorage.getItem('userData'))
        let localToken = localStorage.getItem('accessToken')

        if (localUser) {
            setUserData(localUser)
        }
        if (localToken) {
            setAccessToken(localToken)
        }

        setIsLoading(false)
    }, [])


    const login = (token, user) => {
        localStorage.setItem('accessToken', token)
        localStorage.setItem('userData', JSON.stringify(user))
        setAccessToken(token)
        setUserData(user)
    }


    const logout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userData')
        setAccessToken(undefined)
        setUserData(undefined)
    }

    const authFetch = async (url, options = {}) => {
        const makeOptions = (token) => ({
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        // 1) First try
        let res = await fetch(url, makeOptions(accessToken));

        if (res.status !== 401) return res;

        // 2) Try refresh
        if (!refreshToken) {
            logout(); // navigate to login or perform logout
            throw new Error('No refresh token');
        }

        const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!refreshRes.ok) {
            logout();
            throw new Error('Refresh failed');
        }

        const data = await refreshRes.json();
        const newAccess = data.accessToken;
        const newRefresh = (data.refreshToken) ?? refreshToken;

        setAccessToken(newAccess);
        localStorage.setItem('accessToken', newAccess);
        localStorage.setItem('refreshToken', newRefresh)

        // 3) Retry original request with fresh token
        res = await fetch(url, makeOptions(newAccess));

        if (res.status === 401) {
            logout();
            throw new Error('Unauthorized after refresh');
        }

        return res;
    };

    // Use useMemo to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        userData,
        accessToken,
        isLoading,
        login,
        logout,
        setUserData,
        setAccessToken
    }), [userData, accessToken, isLoading]); // Only recreate when these actually change

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider

export const useAuthContext = () => useContext(AuthContext)