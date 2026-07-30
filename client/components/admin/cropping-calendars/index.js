import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Grid, Typography } from '@mui/material/'
import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { upsertCroppingCalendar } from '@/services/crop_calendar_request'

import { ADAPTER_STATES } from '@/store/constants'

import { assetPrefixer } from '@/utils/img-loader'
import FileUploader from '@/common/ui/fileuploader'

import styles from './styles'

function CroppingCalendar() {
  const [state, setState] = useState([])
  const [cropType, setCropType] = useState('')
  const cropTypes = ['Rice', 'Corn', 'Cassava', 'PoleSitao', 'Ampalaya', 'Tomato','Cucumber']
  // const [file, setFile] = useState(null)
  const sLoading = useSelector((state) => state.seasonalweather.status)

  const handleChange = (event) => {
    setCropType(event.target.value)
  }

  const handleClearList = () => {
    setState(state.map((item) => ({ ...item, isValid: false, value: '' })))
  }

  const handleFileUpload = async (formFile) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Upload the excel file
        await upsertCroppingCalendar(formFile, cropType)

        // handleClearList()
        resolve(true)
      } catch (err) {
        reject(err)
      }
    })
  }

  const handleFileSelected = (file) => {
    // setFile(file)

    if (!file) {
      handleClearList()
    }
  }

  return (
    <div>
      <Typography variant="h5">Cropping Calendar Management</Typography>
      <p>
        <strong>Manage cropping calendars</strong> by uploading Excel-formatted
        templates.
      </p>

      <p>
        Before uploading cropping calendars with data,{' '}
        <strong>first download the template</strong> of the respective crop you
        will add into the system.
      </p>

      <br />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">
            List of Crop Types and their Templates
          </Typography>
          <br />

          <Typography variant="body2" sx={styles.subheader}>
            <a
              href={assetPrefixer(
                `files/${process.env.CROPPING_CALENDAR_RICE_EXCEL_FILE}`,
              )}
              target="__blank"
            >
              [Rice Cropping Calendar Excel template]
            </a>
            <br />
            <br />
            <a
              href={assetPrefixer(
                `files/${process.env.CROPPING_CALENDAR_CORN_EXCEL_FILE}`,
              )}
              target="__blank"
            >
              [Corn Cropping Calendar Excel template]
            </a>
            <br />
            <br />
            <a
              href={assetPrefixer(
                `files/${process.env.CROPPING_CALENDAR_AMPALAYA_EXCEL_FILE}`,
              )}
              target="__blank"
            >
              [Ampalaya Cropping Calendar Excel template]
            </a>
            <br />
            <br />
            <a
              href={assetPrefixer(
                `files/${process.env.CROPPING_CALENDAR_TOMATO_EXCEL_FILE}`,
              )}
              target="__blank"
            >
              [Tomato Cropping Calendar Excel template]
            </a>
            <br />
            <br />
            <a
              href={assetPrefixer(
                `files/${process.env.CROPPING_CALENDAR_CUCUMBER_EXCEL_FILE}`,
              )}
              target="__blank"
            >
              [Cucumber Cropping Calendar Excel template]
            </a>
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <p>
            <strong>Upload Cropping Calendar</strong>
          </p>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Crop Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={cropType}
                label="Crop Type"
                onChange={handleChange}
              >
                {cropTypes.map((cropType) => {
                  return (
                    <MenuItem key={cropType} value={cropType}>
                      {cropType}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Box>

          <br />

          <Grid item xs={12}>
            {/** PAGASA Excel file uploader */}
            <FileUploader
              label="Upload an excel file"
              name="excelfile"
              fileAccepts="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              isDisabled={sLoading === ADAPTER_STATES.PENDING || !cropType}
              fileUploadMethod={handleFileUpload}
              onFileSelectedCB={handleFileSelected}
            />
            <Typography variant="caption">
              Please select <strong>Crop Type</strong> first before uploading a
              file.
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

export default CroppingCalendar
