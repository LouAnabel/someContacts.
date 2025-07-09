import React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

function AuthContextProvider({children}) {
    const [userData, setUserData] = useState(undefined)
    const [accessToken, setAccessToken] = useState(undefined)
    const [ isLoading, setIsLoading ] = useState(true)

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

    const logout= () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        setAccessToken(undefined)
        setUserData(undefined)
    }


  return (
    <AuthContext.Provider value={{
        userData, 
        accessToken,
        isLoading,
        login,
        logout,
        setUserData,
        setAccessToken
    }}>
        {children}
    </AuthContext.Provider>

  )
}

export default AuthContextProvider

export const useAuthContext = () => useContext(AuthContext)