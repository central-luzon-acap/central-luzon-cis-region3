import { useState } from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ModalDialogWrapper from '@/common/ui/modal'
import SimpleSnackbar from '@/common/ui/snackbar'
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton} from '@mui/x-data-grid'
import UserForm from './userform'
import UserView from './userview'
import styles from './styles'
import stylesDatagrid from '@/bacap/datagrid.styles'

function CustomToolbar(props) {
  return (
    <GridToolbarContainer {...props}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  )
}

const MODE = { CREATE: 0, VIEW: 1, EDIT: 2, DELETE: 3 }

const MODAL_SETTINGS = {
  [MODE.CREATE]: {
    windowTitle: 'Create a New User',
    buttonText: 'Create User',
    yesBtnText: 'Save'
  },
  [MODE.VIEW]: {
    windowTitle: 'User Information',
    buttonText: 'View',
    yesBtnText: 'Edit'
  },
  [MODE.EDIT]: {
    windowTitle: 'Update User Information',
    buttonText: 'Edit',
    yesBtnText: 'Update'
  },
  [MODE.DELETE]: {
    windowTitle: 'User Information',
    buttonText: 'Delete',
    yesBtnText: 'Delete'
  }
}

function Users ({
  state,
  loadstatus,
  loadingusers,
  rows,
  columns,
  onTextChange,
  onEditStart,
  handleCreateUser,
  handleDeleteUser,
  handleUpdateUser,
  handleInputClick,
  inputValidation,
  usersLoadingError,
}) {
  const [userinfo, setUserInfo] = useState({})
  const [profileDialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState(MODE.CREATE)

  return (
    <div>
      <Typography variant='h5'>
        Users Management
      </Typography>
      <p>Manage admin user accounts</p>
      <br />

      {/** Create New User Button */}
      <ModalDialogWrapper
        isOpen={
          (loadstatus.dialogOpen &&
            [MODE.CREATE, MODE.DELETE].includes(dialogMode)) ||
          (profileDialogOpen &&
            [MODE.VIEW, MODE.EDIT].includes(dialogMode))
        }
        maxWidth='xs'
        openButtonText='Create User'
        title={MODAL_SETTINGS[dialogMode].windowTitle}
        confirmBtnText={MODAL_SETTINGS[dialogMode].yesBtnText}
        extraBtnText={dialogMode === MODE.VIEW
          ? MODAL_SETTINGS[MODE.DELETE].buttonText
          : ''
        }
        loading={loadstatus.isLoading}
        colorTheme='secondary'
        modalConfirmHandlerCB={() => {
          switch (dialogMode) {
            case MODE.CREATE:
              handleCreateUser()
              break
            case MODE.VIEW:
              setDialogMode(MODE.EDIT)
              break
            case MODE.EDIT:
              handleUpdateUser()
              setDialogMode(MODE.CREATE)
              break
            default:
              break
          }
        }}
        modalCancelHandlerCB={() => {
          handleInputClick()
          setDialogOpen(false)
        }}
        modalOpenHandlerCB={() => {
          setDialogMode(MODE.CREATE)
          setDialogOpen(true)
        }}
        modalExtraHandlerCB={() => {
          setDialogMode(MODE.DELETE)
          handleDeleteUser(userinfo.uid, userinfo.email)
        }}
      >
        {(dialogMode === MODE.CREATE ||
          dialogMode === MODE.EDIT)
          ? <UserForm
              state={state}
              loadstatus={loadstatus}
              onTextChange={onTextChange}
              inputValidation={inputValidation}
              handleInputClick={handleInputClick}
              type='create'
            />
          : <UserView
              userinfo={userinfo}
            />
        }
      </ModalDialogWrapper>

      {/** Firebase Auth Users list */}
      <Box sx={styles.gridContainer} style={{ height: (rows.length <= 4) ? '500px' : 'unset' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          sx={stylesDatagrid.datagrid}
          rowHeight={48}
          autoHeight={rows.length >= 5}
          disableDensitySelector
          rowsPerPageOptions={[15, 30, 100]}
          error={usersLoadingError !== ''
            ? usersLoadingError
            : null
          }
          components={{ Toolbar: CustomToolbar }}
          loading={loadingusers}
          initialState={{
            columns: {
              // Hide the uid on display only
              columnVisibilityModel: {
                rowId: false
              },
            },
            pagination: {
              // Set the initial page rows length
              pageSize: 12,
            },
          }}
          /* eslint-disable no-unused-vars */
          onRowClick={(params) => {
            // Click a table row. Store the row data as local user state.
            // Re-construct the original user data format
            const temprow = { ...params.row }
            temprow.account_level = (temprow.acclevel === 'Admin') ? 2 : 1
            temprow.displayname = temprow.displayName
            temprow.emailverified = temprow.emailVerified

            // Update the state on parent
            onEditStart(temprow.uid, 'edit')

            // Set user info for viewing
            setUserInfo(temprow)
            setDialogMode(MODE.VIEW)
            setDialogOpen(true)
          }}
        />
      </Box>

      {/** Notification alert Snackbar */}
      {(loadstatus.error !== '' || loadstatus.message !== '') &&
        <SimpleSnackbar
          openSnackbar={true}
          message={(loadstatus.error !== '')
            ? loadstatus.error
            : loadstatus.message
          }
          severity={(loadstatus.error !== '')
            ? 'error'
            : 'success'}
        />
      }
    </div>
  )
}

Users.propTypes = {
  /** State of the input fields */
  state: PropTypes.object,
  /** Remote data loading, error and success information */
  loadstatus: PropTypes.object,
  /** Saves user input to its local state */
  onTextChange: PropTypes.func,
  /** Copies a clicked row's user info back to the parent state */
  onEditStart: PropTypes.func,
  /** Creates a new Firebase Auth user with custom claims. */
  handleCreateUser: PropTypes.func,
  /** Deletes a Firebase Auth user. */
  handleDeleteUser: PropTypes.func,
  /** Updates a non-superadmin Firebase Auth user. */
  handleUpdateUser: PropTypes.func,
  /** Clears input fields on click */
  handleInputClick: PropTypes.func,
  /** Object[] with simple validation messages for each input field (state) */
  inputValidation: PropTypes.object,
  /** Error message encountered while loading the users list */
  usersLoadingError: PropTypes.string,
}

export default Users
