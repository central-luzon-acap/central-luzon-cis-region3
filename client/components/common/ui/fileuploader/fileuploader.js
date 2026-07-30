import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import FileInput from './fileinput'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import ModalDialogWrapper from '@/common/ui/modal'
import SimpleSnackbar from '@/common/ui/snackbar'
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone'
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone'
import EndButton from './endbutton'
import styles from './styles'
import CaptionText from '@/common/ui/captiontext'

function FileUploaderComponent ({
  file,
  state,
  name,
  label = '',
  textContent = '',
  fileAccepts,
  isDisabled = false,
  handleUpload,
  onUploadClick,
  handleResetMessage,
  setSelectedFile,
  clearFile
}) {
  const btnStyle = { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
  const fileRef = useRef()

  useEffect(() => {
    if (file === null) {
      // Reset the raw <input> file value
      fileRef.current.value = null
    }
  }, [file])

  return (
    <Grid container sx={styles.container}>
      {state.open &&
        <ModalDialogWrapper
          isOpen
          title='Upload file'
          contentText={state.modalMsg}
          loading={state.loading}
          openButtonText={null}
          modalCancelHandlerCB={handleResetMessage}
          modalConfirmHandlerCB={handleUpload}
        />
      }

      {(state.msg !== '') &&
        <SimpleSnackbar
          openSnackbar
          message={state.msg}
          severity={state.type}
          closeHandlerCB={handleResetMessage}
        />
      }

      <Grid item xs={12} lg={6} sx={styles.wrapper}>
        {/** Title/label */}
        <Typography variant='subtitle2'>{label}</Typography>

        {/** Description text */}
        <CaptionText>
          {textContent}
        </CaptionText>

        {/** File uploader */}
        <FileInput
          size='small'
          disabled
          value={file !== null ? file[0].name : ''}
          sx={{ fontSize: '10px' }}
          InputProps={{
            style: styles.textfield,
            startAdornment:
              <EndButton
                variant='outlined'
                disableElevation
                component='label'
                disabled={state.loading || isDisabled}
                sx={{ width: '48px', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                onClick={(e) => {
                  if (file !== null) {
                    clearFile(e)
                  }
                }}
              >
                {(file === null)
                  ? <SearchTwoToneIcon />
                  : <CancelTwoToneIcon />
                }

                <Box sx={styles.fileInputContainer}>
                  <input
                    type='file'
                    multiple
                    // hidden
                    ref={fileRef}
                    accept={fileAccepts || '.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'}
                    name={name || 'excelfile'}
                    onChange={setSelectedFile}
                    style={{ border: '1px solid' }}
                  />
                </Box>
              </EndButton>,
            endAdornment:
              <EndButton
                size='small'
                component='span'
                variant='contained'
                disableElevation
                disabled={file === null || state.loading}
                sx={btnStyle}
                onClick={onUploadClick}
              >
                Upload
              </EndButton>
          }}
        />
      </Grid>
    </Grid>
  )
}

FileUploaderComponent.propTypes = {
  /** Array of input file (s) */
  file: PropTypes.object,
  /** Local component message and loading states */
  state: PropTypes.object,
  /** <input> "name" attribute */
  name: PropTypes.string,
  /** File uploader label */
  label: PropTypes.string,
  /** Descriptive text */
  textContent: PropTypes.string,
  /** <input> "accepts" attribute - comma-separated mime types of accepted files for upload */
  fileAccepts: PropTypes.string,
  /** Disables file selection */
  isDisabled: PropTypes.bool,
  /** Handles the file upload async method*/
  handleUpload: PropTypes.func,
  /** Upload button click handler */
  onUploadClick: PropTypes.func,
  /** Callback method for the modal and snackbar's cancel options */
  handleResetMessage: PropTypes.func,
  /** Sets the local selected file */
  setSelectedFile: PropTypes.func,
  /** Resets the local selected file */
  clearFile: PropTypes.func
}

export default FileUploaderComponent
