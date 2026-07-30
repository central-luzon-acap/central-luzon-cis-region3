import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth, formatError } from '@/services/auth'
import { ACCOUNT_LEVEL } from '@/utils/constants'
import Login from '@/components/login'

const defaultState = {
  email: '', password: '', error: ''
}

function CommonLoginContainer ({ accLevel = 2, loginTitle = '' }) {
  const [state, setState] = useState(defaultState)
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (auth.user && !auth.loading && auth.error === '') {
      const loginSuccessRoute = (accLevel === ACCOUNT_LEVEL.ADMIN)
        ? '/admin'
        : '/superadmin'

      if (auth.user.accountlevel === accLevel) {
        router.push(loginSuccessRoute)
      } else {
        auth.logOut()
        setState(prev => ({ ...prev, error: 'Unauthorized account level.' }))
      }
    }
  }, [auth, accLevel, router])

  useEffect(() => {
    if (auth.error !== '') {
      setState(prev => ({ ...prev, error: auth.error }))
    }
  }, [auth.error])

  const onInputChange = (e) => {
    const { id, value } = e.target
    setState(prev => ({ ...prev, [id]: value }))

    if (state.error !== '') {
      setState({ ...state, error: '' })
    }
  }

  const onInputClick = (e) => {
    setState(prev => ({ ...prev, [e.target.id]: '', error: '' }))
  }

  const onBtnClick = async () => {
    try {
      await auth.signIn({ email: state.email, password: state.password })
    } catch (err) {
      setState(prev =>
        ({ ...prev, error: formatError(err.message) }))
    }
  }

  const onBtnLogoutClick = async () => {
    await auth.logOut()
  }

  return (
    <Login
      loading={auth.loading}
      hasUser={auth.user}
      state={state}
      loginTitle={loginTitle}
      onInputChange={onInputChange}
      onInputClick={onInputClick}
      onBtnClick={onBtnClick}
      onBtnLogoutClick={onBtnLogoutClick}
    />
  )
}

export default CommonLoginContainer
