import { useState, useEffect, forwardRef } from 'react'
import { useDispatch } from 'react-redux'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Fade from '@mui/material/Fade'
import { shouldShowWelcome } from '@/store/dashboard/dashboardSlice'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade in={true} ref={ref} {...props} />
})

function WelcomeModal ({ title = 'Modal Title', description = [], isOpen = false, children }) {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    let mounted = true

    setTimeout(() => {
      if (mounted && isOpen) {
        setOpen(true)
      }
    }, 1000)
    return () => (mounted = false)
  }, [isOpen])

  const handleClose = () => {
    setOpen(false)
    dispatch(shouldShowWelcome(false))
  }

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby='slider-modal-description'
      id='bacap-intro'
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description.map((sentence, index) => (
          <DialogContentText id='slider-modal-description' key={index} variant='body1' sx={{ marginTop: '16px' }}>
            {sentence}
          </DialogContentText>
        ))}

        {children}
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default WelcomeModal
