import React from 'react'
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

function AuthContextProvider({children}) {
    const [userData, setUserData] = useState(undefined)
    const [accessToken, setAccessToken] = useState(undefined)

    useEffect(() => {
        let localUser = JSON.parse(localStorage.getItem('userData'))
        let localToken = localStorage.getItem('authToken')

        if (localUser) {
            setUserData(localUser)
        }
        if (localToken) {
            setAccessToken(localToken)
        }
    }, [])

    const login = (token, user) => {
        localStorage.setItems('authToken', token)
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
    <AuthContext.Provider value={{userData, accessToken}}>
        {children}
    </AuthContext.Provider>

  )
}

export default AuthContextProvider

export const useAuthContext = () => useContext(AuthContext)