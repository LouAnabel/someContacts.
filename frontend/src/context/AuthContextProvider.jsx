import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const AuthContext = createContext()

function AuthContextProvider({children}) {
    const [userData, setUserData] = useState(undefined)
    const [accessToken, setAccessToken] = useState(undefined)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let localUser = JSON.parse(localStorage.getItem('userData'))
        let localToken = localStorage.getItem('authToken')

        if (localUser) {
            setUserData(localUser)
        }
        if (localToken) {
            setAccessToken(localToken)
        }

        setIsLoading(false) // after check localStorage
    }, [])


    const login = (token, user) => {
        localStorage.setItem('authToken', token)
        localStorage.setItem('userData', JSON.stringify(user))
        setAccessToken(token)
        setUserData(user)
    }


    const logout = () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        setAccessToken(undefined)
        setUserData(undefined)
    }

    // Use useMemo to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        userData, 
        accessToken,
        isLoading,
        login,
        logout,
        setUserData,
        setAccessToken
    }), [userData, accessToken, isLoading]) // Only recreate when these values actually change

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider

export const useAuthContext = () => useContext(AuthContext)