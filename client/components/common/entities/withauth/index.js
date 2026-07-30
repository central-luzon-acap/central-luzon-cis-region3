import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/services/auth'
import { ACCOUNT_LEVEL } from '@/utils/constants'

// This is a HOC that wraps a Component with firebase auth info and makes wrapped Components
// elligible to render with the signed-in admin <ProtectedPage /> and <AdminDrawer /> components.
// It also:
// - Redirects to login page if a protected page is accessed while signed-out
// - Redirects to the unauthorized page if user tries to access an off-limits page
// - Provides firebase auth info props to child components
function withAuthListener (Component) {
  function AuthListener (props) {
    const auth = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!auth.loading && !auth.user) {
        const loginRoute = (router.pathname.includes('/superadmin'))
          ? '/superadmin/login'
          : '/admin/login'
        router.push(loginRoute)
      }

      if (auth.user) {
        // Redirect to the unauthorized access page
        if (auth.user.accountlevel === ACCOUNT_LEVEL.ADMIN
          && router.pathname.includes('/superadmin')) {
          router.push('/unauthorized')
        }

        if (auth.user.accountlevel === ACCOUNT_LEVEL.SUPERADMIN
          && router.pathname.includes('/admin')) {
          router.push('/unauthorized')
        }
      }
    }, [auth.user, auth.loading, router])

    const onBtnLogoutClick = async () => {
      try {
        await auth.logOut()
      } catch (err) {
        // console.log(err.message)
      }
    }

    return (
      <Component
        {...props}
        loading={auth.loading}
        user={auth.user}
        onBtnLogoutClick={onBtnLogoutClick}
      />
    )
  }

  AuthListener.customLayout = true
  AuthListener.adminPage = true
  return AuthListener
}

export default withAuthListener
