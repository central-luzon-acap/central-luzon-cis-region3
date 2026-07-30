import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Snackbar } from '@mui/material/'
import MuiAlert from '@mui/material/Alert'

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

function SimpleSnackbar({
  openSnackbar,
  message,
  severity,
  closeHandlerCB = () => {},
}) {
  const [open, setOpen] = useState(openSnackbar)

  // Listener for openSnackbar
  useEffect(() => {
    setOpen(openSnackbar)
  }, [openSnackbar])

  const handleClose = () => {
    setOpen(false)
    closeHandlerCB()
  }

  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}

SimpleSnackbar.propTypes = {
  openSnackbar: PropTypes.bool,
  message: PropTypes.string,
  severity: PropTypes.string,
}

export default SimpleSnackbar
