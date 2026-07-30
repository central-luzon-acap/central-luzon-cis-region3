import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { ACCOUNT_LEVEL } from '@/utils/constants'
import {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateUser
} from '@/services/user'
import { useFirebaseUsers } from '@/hooks/usefirebaseusers'
import {
  isValidEmail,
  isValidName,
  isValidPassword
} from '@/utils/input_validator'
import withAuthListener from '@/common/entities/withauth'
import ProtectedPage from '@/common/layout/protectedpage'
import Users from '@/components/superadmin/users'

const defaultState = {
  email: '',
  displayname: '',
  password: '',
  account_level: 2,
  disabled: false,
  emailverified: true,
  mode: 'create'
}

const defaultLoadingState = {
  isLoading: false,
  dialogOpen: false,
  error: '',
  message: ''
}

const defaultValidationState = {
  email: '',
  displayname: '',
  password: '',
  account_level: '',
  disabled: '',
  emailverified: ''
}

function UsersContainer (props) {
  // User input state
  const [state, setState] = useState(defaultState)

  // Loading status indicators
  const [loading, setLoading] = useState(defaultLoadingState)

  // Local input validation messages
  const [validationMsgs, setValidation] = useState(defaultValidationState)

  // Admin users masterlist
  const [adminusers, setAdminUsers] = useState([])

  // Initial loading all the Firebase Auth users
  const {
    users,
    loading: usersLoading,
    error: usersLoadingError } = useFirebaseUsers()

  // DataGrid rows and columns data
  const [rows, setRows] = useState([])
  const [columns, setColumns] = useState([])

  // Set the admins masterlist initial values from 1st page load
  useEffect(() => {
    if (users !== null) {
      /* eslint-disable no-unused-vars */
      setAdminUsers(prev => users.users)
    }
  }, [users])

  useEffect(() => {
    // Format and build the users data for DataGrid everytime the adminusers list changes
    if (adminusers.length > 0) {
      const headers = ['email', 'displayName', 'acclevel', 'emailVerified', 'disabled', 'last_signin' ]
      const headersFormat = {
        email: { label: 'Email', width: 280 },
        displayName: { label: 'Display Name', width: 200 },
        acclevel: { label: 'Acc. Type', width: 120 },
        emailVerified: { label: 'Email Verified', width: 125 },
        disabled: { label: 'Acc. Disabled', width: 120 },
        last_signin: { label: 'Last Signin', width: 250 },
      }

      const colData = headers.reduce((acc, item, index) => {
        acc.push({
          field: item,
          headerName: headersFormat[item].label,
          width: headersFormat[item].width,
          align: (index > 1) ? 'center' : 'left',
          headerAlign: (index > 1) ? 'center' : 'left',
          editable: false,
          sortable: false,
          disableColumnMenu: true,
          renderCell: (cellValues) => {
            return <div
              style={{
                fontSize: (item === 'last_signin') ? '13px' : '14px'
              }}
            >
              {cellValues.value.toString()}
            </div>
          }
        })
        return acc
      }, [])

      // Set the rows data
      const rowdata = adminusers
        .filter(x => x.customClaims !== undefined)
        .map((item, i) => ({
          id: i,
          uid: item.uid,
          email: item.email,
          displayName: item.displayName,
          acclevel: (item.customClaims.account_level === 1)
            ? 'Superadmin' : 'Admin',
          emailVerified: item.emailVerified,
          disabled: item.disabled,
          date_created: item.metadata.creationTime,
          last_signin: (item.metadata.lastSignInTime)
            ? item.metadata.lastSignInTime
            : '-'
        }))

      // Set DataGrid's rows and columns data
      setRows(rowdata)
      setColumns(colData)
    }
  }, [adminusers])

  // Handle text input change
  const onInputChange = (e) => {
    let { id, value, checked } = e.target
    const key = (id !== undefined) ? id : 'account_level'

    if (['emailverified', 'disabled'].includes(key)) {
      value = checked
    }

    // Set the new input on state
    setState({ ...state, [key]: value })

    // Clear error, success and validation messages
    if (loading.error !== ''
      || loading.message !== ''
      || Object.keys(validationMsgs)
          .filter(field => validationMsgs[field] !== '').length > 0) {
      setLoading(defaultLoadingState)
      setValidation(defaultValidationState)
    }
  }

  // Clear the value of a text input field
  const onInputClick = (e) => {
    if (e) {
      const { id } = e.target
      setState({ ...state, [id]: '' })
    } else {
      // Clear all input
      setState(defaultState)
      setLoading(defaultLoadingState)
    }

    setValidation(defaultValidationState)
  }

  // Extract the values from a user object
  // and rename fields to lowercase similar to the defaultState
  const fieldsToLowercase = (userObj) => {
    const temp = Object.keys(defaultState).reduce((acc, curr) => {
      acc[curr] = userObj[curr]
      return acc
    }, {})

    if (temp === null) {
      return
    }

    temp.uid = userObj.uid
    temp.account_level = userObj.customClaims.account_level
    temp.displayname = userObj.displayName
    temp.emailverified = userObj.emailVerified
    temp.password = ''
    return temp
  }

  // Set the current user state for editing
  const onEditStart = (uid, mode = 'create') => {
    const user = adminusers.find(admin => admin.uid === uid)
    let temp = fieldsToLowercase(user)
    temp = { ...temp, mode }
    setState(temp)
  }

  // Set loading status indicators
  const startLoading = () => {
    setLoading({
      ...defaultLoadingState,
      dialogOpen: true,
      isLoading: true
    })
  }

  // Stop loading status indicators and set error/success messages
  const finishLoading = ({ message = '', error = '' }) => {
    /* eslint-disable no-unused-vars */
    setLoading(prev => ({
      ...defaultLoadingState,
      message,
      error
    }))

    // Reset the form input
    setState(prev => ({
      ...defaultState
    }))
  }

  // Validate input text on state
  const validate = (mode = 'create') => {
    let hasError = 0
    let msgs = {}

    if (!isValidEmail(state.email)) {
      msgs.email = 'Please check your email input.'
      hasError += 1
    }

    if (!isValidName(state.displayname)) {
      msgs.displayname = 'Please check your display name.'
      hasError += 1
    }

    // Require password when creating new users only
    if (mode === 'create') {
      if (!isValidPassword(state.password)) {
        msgs.password = 'Please check your password input.'
        hasError += 1
      }
    }

    setValidation({ ...validationMsgs, ...msgs })
    return (hasError === 0)
  }

  // Create a new user
  const createNewUser = async () => {
    if (!validate('create')) {
      return
    }

    try {
      startLoading()
      await createUser(state)

      // Reload users list
      const { data } = await getUsers()
      setAdminUsers(data.users)

      finishLoading({
        message: `User successfully ${state.email} created!`
      })
    } catch (err) {
      finishLoading({
        error: err.response
          ? err.response.data
          : err.message
      })
    }
  }

  // Delete a user
  const deleteAdminUser = async (uid, email) => {
    try {
      startLoading()
      await deleteUser(uid)

      // Reload users list
      const { data } = await getUsers()
      setAdminUsers(data.users)

      finishLoading({
        message: `Successfully deleted user ${email}!`
      })
    } catch (err) {
      finishLoading({
        error: err.response
          ? err.response.data
          : err.message
      })
    }
  }

  // Update the Firebase Auth details of an existing user
  const updateAdminUser = async () => {
    if (!validate('edit')) {
      return
    }

    try {
      startLoading()
      await updateUser(state)

      // Fetch the updated Auth user info
      const guser = await getUser({
        uid: state.uid,
        email: state.email
      })

      // Replace the updated user's record in the adminusers' state
      const idx = adminusers.findIndex(user => user.uid === guser.uid)

      if (idx >= 0) {
        const temp = [...adminusers]
        temp[idx] = guser
        setAdminUsers(temp)
      }

      finishLoading({
        message: `Successfully updated ${state.email}'s details!`
      })
    } catch (err) {
      finishLoading({
        error: err.response
          ? err.response.data
          : err.message
      })
    }
  }

  return (
    <ProtectedPage
      loading={props.loading}
      user={props.user}
      onBtnLogoutClick={props.onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.SUPERADMIN}
    >
      <Users
        state={state}
        loadstatus={loading}
        loadingusers={usersLoading}
        rows={rows}
        columns={columns}
        onTextChange={onInputChange}
        onEditStart={onEditStart}
        handleCreateUser={createNewUser}
        handleDeleteUser={deleteAdminUser}
        handleUpdateUser={updateAdminUser}
        handleInputClick={onInputClick}
        inputValidation={validationMsgs}
        usersLoadingError={usersLoadingError}
      />
    </ProtectedPage>
  )
}

UsersContainer.propTypes = {
  /** Firebase Auth user authentication loading state */
  loading: PropTypes.bool,
  /** Minimal Firebase Auth user data */
  user: PropTypes.object,
  /** Callback for signing-out a Firebase Auth user */
  onBtnLogoutClick: PropTypes.func,
  /** Firebase Auth user's "account_level" custom claims */
  accLevel: PropTypes.number
}

export default withAuthListener(UsersContainer)
