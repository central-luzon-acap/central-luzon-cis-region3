import { useState } from 'react'
import { useSelector } from 'react-redux'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'

import { upsertCropRecommendations } from '@/services/crop_recommendations_upload'
import { assetPrefixer } from '@/utils/img-loader'

import { ADAPTER_STATES } from '@/store/constants'

import FileUploader from '@/common/ui/fileuploader'

import styles from './styles'

function UploadRecommendations() {
  const [state, setState] = useState([])
  const [cropType, setCropType] = useState('')
  const cropTypes = ['Rice', 'Corn', 'Cassava', 'PoleSitao', 'Ampalaya']

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
        await upsertCropRecommendations(formFile, cropType)

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
      <p>
        <strong>Manage recommendations</strong> by uploading Excel-formatted
        templates.
      </p>

      <p>
        Before uploading recommendations with data,{' '}
        <strong>first download the template</strong> of the respective crop you
        will add into the system.
      </p>

      <br />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">
            List of Crop Recommendations and their Templates
          </Typography>
          <br />

          <Typography variant="body2" sx={styles.subheader}>
            <a
              href={assetPrefixer(
                `files/${process.env.RECOMMENDATIONS_RICE_EXCEL_FILE}`,
              )}
              target="__blank"
            >
              [Rice Recommendations Excel template]
            </a>
            <br />
            <br />
            <a
              href={assetPrefixer(
                `files/${process.env.RECOMMENDATIONS_CORN_EXCEL_FILE}`,
              )}
              target="__blank"
            >
              [Corn Recommendations Excel template]
            </a>
            <br />
            <br />
            <a
              href={assetPrefixer(
                `files/${process.env.RECOMMENDATIONS_AMPALAYA_EXCEL_FILE}`,
              )}
              target="__blank"
            >
              [Ampalaya Recommendations Excel template]
            </a>
            <br />
            <br />
            <a
              href={assetPrefixer(
                `files/${process.env.RECOMMENDATIONS_TOMATO_EXCEL_FILE}`,
              )}
              target="__blank"
            >
              [Tomato Recommendations Excel template]
            </a>
            <br />
            <br />
            <a
              href={assetPrefixer(
                `files/${process.env.RECOMMENDATIONS_CUCUMBER_EXCEL_FILE}`,
              )}
              target="__blank"
            >
              [Cucumber Recommendations Excel template]
            </a>
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <p>
            <strong>Upload Recommendations</strong>
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

export default UploadRecommendations
