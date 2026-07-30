import { useDispatch } from 'react-redux'
import { createContext, useContext, useState, useEffect } from 'react'
import { auth, signOut, signInWithEmailAndPassword, onAuthStateChanged } from '@/firebase/firebase.config'
import { profileReceived } from '@/store/users/userSlice'

const authContext = createContext()

export function AuthProvider ({ children }) {
  const authuser = useFirebaseAuth()
  return <authContext.Provider value={authuser}>{children}</authContext.Provider>
}

export const useAuth = () => {
  return useContext(authContext)
}

function useFirebaseAuth () {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const dispatch = useDispatch()

  const handleError = (errMsg = '') => {
    setUser(null)
    setLoading(false)
    setError(errMsg)
  }

  const signIn = async ({ email, password }) => {
    setLoading(true)
    setError('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setLoading(false)
      throw new Error(formatError(err.message))
    }
  }

  const logOut = async () => {
    try {
      setLoading(true)
      await signOut(auth)
      setError('')
    } catch (err) {
      setLoading(false)
      throw new Error(formatError(err.message))
    }
  }

  useEffect(() => {
    const handleUser = async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await formatUser(firebaseUser)
          const { claims } = await firebaseUser.getIdTokenResult()

          if (claims.account_level) {
            const userObj = {
              ...user,
              accountlevel: claims.account_level,
              accessToken: firebaseUser.accessToken
            }

            setUser(userObj)
            dispatch(profileReceived(userObj))
            setLoading(false)
            return user
          } else {
            await signOut(auth)
            handleError('Not a BACAP user. Missing custom claims.')
            return null
          }
        } catch (err) {
          handleError(formatError(err.message))
          return null
        }
      } else {
        // TO-DO: Investigate this part.
        // Intermittently signs-out a user when switching from superadmin and admin accounts
        handleError('')
        dispatch(profileReceived(null))
        return null
      }
    }

    const unsubscribe = onAuthStateChanged(auth, handleUser)
    return () => unsubscribe()
  }, [dispatch])

  return {
    user,
    loading,
    error,
    useAuth,
    signIn,
    logOut
  }
}

const formatUser = async (user) => {
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    accountlevel: user.accountLevel
  }
}

export const formatError = (errMsg) => {
  return errMsg.toLowerCase().replaceAll(/firebase: /g, '')
}
