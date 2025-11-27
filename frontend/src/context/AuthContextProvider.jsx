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
            console.log('No tokens found - user not logged in');
            logout();
        } else if (!localRefreshToken) {
            console.log('No refresh token - logging out');
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
        const token = localStorage.getItem('accessToken');
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        // If 401, logout (backend says token is invalid/expired)
        if (response.status === 401) {
            logout();
            throw new Error('Session expired - please login again');
        }

        return response;
    }, [logout]);

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