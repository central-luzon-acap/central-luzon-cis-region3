import Box from '@mui/material/Box'
import AdminDrawer from '../admindrawer'
import LoadingCover from '@/common/ui/loadingcover'

function ProtectedPage (props) {
  return (
    <Box sx={{ marginTop: (theme) => theme.spacing(4) }}>
      {props.loading && <LoadingCover />}
      {(!props.loading
        && props.user
        && props.user.accountlevel === props.accLevel) &&
        <AdminDrawer
          user={props.user}
          onBtnLogoutClick={props.onBtnLogoutClick}
        >
          {props.children}
        </AdminDrawer>}
    </Box>
  )
}

export default ProtectedPage
