import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import Button from '@mui/material/Button'
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import styles from './modal.style'

// Dialog modal that wraps any React Component
// This Dialog has a configurable YES/NO action button actions on the footer
function ModalDialogWrapper(props) {
  const [state, setState] = React.useState({ open: null })

  const {
    loading = false,
    isOpen = false,
    showButtons = true,
    maxWidth = 'sm',
    IconSVG = null,
    modalButtonStyles = {},
    modalExtraHandlerCB = null,
    modalCancelHandlerCB = null,
    modalConfirmHandlerCB = null,
    modalOpenHandlerCB = null,
    isDisabled = false,
  } = props

  const {
    openButtonText = 'Click',
    title = 'Window Title',
    extraBtnText = '',
    cancelBtnText = 'Cancel',
    confirmBtnText = 'Ok',
    contentText = '',
    error = '',
    colorTheme='primary'
  } = props

  // Watch the external isOpen prop
  useEffect(() => {
    setState((prev) => ({ ...prev, open: isOpen }))
  }, [isOpen])

  // Display the Dialog modal after clicking its associated Button
  const handleClickOpen = () => {
    setState({ ...state, open: true })

    // Run external callback
    if (modalOpenHandlerCB) {
      modalOpenHandlerCB()
    }
  }

  // Close the Dialog modal
  const handleClose = () => {
    setState({ ...state, open: false })

    if (modalCancelHandlerCB) {
      // Run the close/cancel callback
      modalCancelHandlerCB()
    }
  }

  return (
    <div>
      {/** An external Button that will display this Dialog when clicked */}
      {openButtonText && (
        <Button
          disabled={isDisabled}
          disableElevation
          variant="contained"
          color={colorTheme}
          onClick={handleClickOpen}
          sx={{...styles.button, ...modalButtonStyles}}
        >
          {IconSVG && <IconSVG sx={styles.icon} />}
          {openButtonText}
        </Button>
      )}

      {/** Dialog start */}
      <Dialog
        maxWidth={maxWidth}
        fullWidth
        open={state.open || false}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {/** Dialog title with a close Icon button */}
        <DialogTitle>
          <span>{title}</span>
          <IconButton
            aria-label="close"
            sx={styles.closeButton}
            onClick={handleClose}
            disabled={loading}
          >
            <CancelPresentationIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={styles.dialogContent}>
          {/** Text content */}
          {contentText !== '' && (
            <div>
              <div>{contentText}</div>
              <div className="error">{error}</div>
            </div>
          )}

          {/** Child Components */}
          {props.children}
        </DialogContent>

        {/** YES/NO/EXTRA Action buttons */}
        {showButtons &&
        <DialogActions sx={styles.dialogActions}>
          {/** 3rd EXTRA Button */}
          {extraBtnText !== '' && (
            <Button
              onClick={modalExtraHandlerCB || handleClose}
              disabled={loading}
            >
              {extraBtnText}
            </Button>
          )}

          {/** NO/Cancel Button */}
          <Button
            onClick={modalCancelHandlerCB || handleClose}
            disabled={loading}
          >
            {cancelBtnText}
          </Button>

          {/** YES/Confirm Button */}
          <Button
            variant="contained"
            disabled={loading}
            onClick={modalConfirmHandlerCB || handleClose}
          >
            <span
              style={{
                display: loading ? 'none' : 'block',
              }}
            >
              {confirmBtnText}
            </span>

            {/** Loading Spinner */}
            <CircularProgress
              size={24}
              color="secondary"
              sx={{
                display: loading ? 'block' : 'none',
              }}
            />
          </Button>
        </DialogActions>
        }
      </Dialog>
    </div>
  )
}

ModalDialogWrapper.propTypes = {
  /** Indicates if the external states is in a loading state */
  loading: PropTypes.bool,
  /** Show/hide the Dialog from outside props */
  isOpen: PropTypes.bool,
  /** Show/hide the control button group */
  showButtons: PropTypes.bool,
  /** Dialog max width */
  maxWidth: PropTypes.string, // xs, sm, lg, etc
  /** Material UI Icon */
  IconSVG: PropTypes.elementType,
  /** Extra styles for the main modal button */
  modalButtonStyles: PropTypes.object,
  /** Callback for the Dialog's NO/Cancel Button and top-right [X] Button */
  /** It executes the external cb while closing the Dialog */
  modalCancelHandlerCB: PropTypes.func,
  /** Callback for the Dialog's YES/Confirm Button */
  modalConfirmHandlerCB: PropTypes.func,
  /** Callback for the Dialog's "openner" Button */
  modalOpenHandlerCB: PropTypes.func,
  /** Callback for the Dialog's "extra" Button */
  modalExtraHandlerCB: PropTypes.func,
  /** Text rendered on the "openner" Button */
  openButtonText: PropTypes.string,
  /** Text rendered on the NO/Cancel Button */
  cancelBtnText: PropTypes.string,
  /** Text rendered on the YES/Confirm Button */
  confirmBtnText: PropTypes.string,
  /** Text rendered on the "Extra"" Button */
  extraBtnText: PropTypes.string,
  /** Dialog window title */
  title: PropTypes.string,
  /** Text content to render. Good fit for simple yes/no or other short prompts */
  contentText: PropTypes.string,
  /** Single or nested React Components */
  children: PropTypes.node,
  /** Error string rendered in small red font. */
  error: PropTypes.string,
  /** Disable/Enable button using a condition. */
  isDisabled: PropTypes.bool,
  /** MUI color palette name to use on the openner button (primary, secondary, etc) */
  colorTheme: PropTypes.string
}

export default ModalDialogWrapper
