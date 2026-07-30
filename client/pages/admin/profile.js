import { useState, useRef } from 'react'
import { ACCOUNT_LEVEL } from '@/utils/constants'
import withAuthListener from '@/common/entities/withauth'
import ProtectedPage from '@/common/layout/protectedpage'
import Profile from '@/components/admin/profile'
import { updateUser } from '@/services/user'
import { DEFAULT_REPORT_DIALOGS } from '@/utils/constants/app'

const defaultState = { ...DEFAULT_REPORT_DIALOGS, title: 'Save changes', msg: 'Do you want to save the new password?' }

function ProfileContainer (props) {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(defaultState)
  const mounted = useRef(false)

  useState(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  const handleUpdateUser = (e) => {
    const { value, id } = e.target

    if (id === 'password') {
      setPassword(value)
    }
  }

  const handleUpdatePassword = async () => {
    if (password === '') {
      setMessage({ ...defaultState, error: 'Please check your input.' })
      return
    }

    try {
      setMessage({ ...message, loading: true, msg: 'Saving changes...' })
      await updateUser({ password, uid: props.user.uid }, props.user.accountlevel)

      if (mounted.current) {
        setMessage({
          ...message,
          loading: false,
          savesuccess: true,
          msg: 'Password updated. You will be signed-out. Please sign-in using your new password.',
        })
      }
    } catch (err) {
      const errMsg = err?.response?.data || err.message

      if (mounted.current) {
        setMessage(prev => ({ ...prev, isOpen: false, loading: false, error: errMsg }))
      }
    }
  }

  return (
    <ProtectedPage
      loading={props.loading}
      user={props.user}
      onBtnLogoutClick={props.onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <Profile
        user={props.user}
        password={password}
        message={message}
        handleUpdateUser={handleUpdateUser}
        handleUpdatePassword={handleUpdatePassword}
        handleSaveSuccess={props.onBtnLogoutClick}
        togglePrompt={() => setMessage(prev => ({ ...defaultState, isOpen: !prev.isOpen }))}
      />
    </ProtectedPage>
  )
}

export default withAuthListener(ProfileContainer)
