import { useState } from 'react'
import PropTypes from 'prop-types'
import FileUploaderComponent from './fileuploader'

const msgTypes = { success: 'success', error: 'error', info: 'info' }
const defaultState = { msg: '', type: '', modalMsg: 'Upload selected file?', loading: false, open: false, }

function FileUploader ({
  label,
  name = 'somefile',
  textContent,
  fileAccepts,
  isDisabled = false,
  fileUploadMethod,
  onFileSelectedCB
}) {
  const [file, setFile] = useState(null)
  const [state, setState] = useState(defaultState)

  const clearFile = (e) => {
    e.preventDefault()
    /* eslint-disable no-unused-vars */
    setFile(prev => null)
    setState(prev => defaultState)

    if (onFileSelectedCB) {
      onFileSelectedCB(null)
    }
  }

  const setSelectedFile = async (e) => {
    setFile(e.target.files)

    if (onFileSelectedCB) {
      onFileSelectedCB(e.target.files)
    }
  }

  const handleUpload = async (e) => {
    if (file.length > 0) {
      e.preventDefault()

      try {
        const formData = new FormData()
        formData.append(name, file[0])

        setState({ ...state, loading: true, modalMsg: 'Uploading file...' })
        await fileUploadMethod(formData)
        /* eslint-disable no-unused-vars */
        setState(prev => ({ ...defaultState, msg: 'Upload success.', type: msgTypes.success }))
        setFile(prev => null)
      } catch (err) {
        let errMsg = ''

        if (err.response !== undefined) {
          errMsg = err.response.data !== undefined ? err.response.data : ''
        }

        if (errMsg === '') {
          errMsg = err.message
        }

        setState(prev => ({ ...defaultState, msg: errMsg, type: msgTypes.error }))
      }
    }
  }

  return (
    <FileUploaderComponent
      file={file}
      state={state}
      label={label}
      name={name}
      textContent={textContent}
      fileAccepts={fileAccepts}
      isDisabled={isDisabled}
      handleUpload={handleUpload}
      onUploadClick={() => setState({ ...state, open: true })}
      handleResetMessage={() => setState(defaultState)}
      setSelectedFile={setSelectedFile}
      clearFile={clearFile}
    />
  )
}

FileUploader.propTypes = {
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
  /** Async method for uploading file */
  fileUploadMethod: PropTypes.func,
  /** Callback method to executre when a file is selected */
  onFileSelectedCB: PropTypes.func
}

export default FileUploader
