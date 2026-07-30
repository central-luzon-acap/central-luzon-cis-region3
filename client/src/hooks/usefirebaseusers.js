import { useEffect, useState } from 'react'
import { getUsers } from '@/services/user'

// Loads all the Firebase Auth users from the /api/users endpoint
export function useFirebaseUsers () {
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUsers()

        setLoading(false)
        setUsers(res.data)
      } catch (err) {
        let errMsg = ''

        if (err.response !== undefined) {
          errMsg = err.response.data !== undefined
            ? err.response.data : ''
        }

        if (errMsg === '') {
          errMsg = err.message
        }

        setError(errMsg)
      }
    }

    load()
  }, [])

  return {users, loading, error}
}
