import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { red } from '@mui/material/colors'
import FileUploader from '@/common/ui/fileuploader'
import styles from './styles'

import CreateTwoToneIcon from '@mui/icons-material/CreateTwoTone'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone'

function CycloneListComponent ({
  state,
  file,
  isDisabled,
  handleInputChange,
  handleClearClick,
  handleFileUpload,
  handleFileSelected
}) {
  return (
    <Grid container sx={styles.container}>
      <Grid item xs={12}>
        {/** PAGASA Excel file uploader */}
        <FileUploader
          label='Upload an excel file'
          name='excelfile'
          fileAccepts='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
          isDisabled={isDisabled}
          fileUploadMethod={handleFileUpload}
          onFileSelectedCB={handleFileSelected}
        />
      </Grid>
      <Grid item xs={12} sx={{ marginTop: '24px' }}>
        {/** No. of Tropical Cyclone input */}
        <Typography variant='h6'>
          Tropical Cyclone Input
        </Typography>
        <Typography variant='body2' sx={styles.text}>
          Select PAGASA&apos;s shared seasonal weather forecast excel file on the <strong>Upload an excel file</strong> selector to unlock the Tropical Cyclone Input items below.
          <br /><br />
          Then, enter the number of tropical cyclones (0 up to 10) for each month with following its picture reference on the 3rd tab <br /> from the selected PAGASA-shared seasonal weather forecast excel file.
          <br /><br />
          Write <span style={{ color: 'orange' }}><b>nda</b></span> if there is &quot;no data available&quot; for the given month.
        </Typography>
      </Grid>

      <Grid item xs={12} lg={7}>
        {state.map((item, index) => (
          <TextField
            key={index}
            id={`month-${index}`}
            size='small'
            label={item.full}
            value={item.value}
            placeholder={`${item.full} no. of cyclones`}
            sx={styles.rowItem}
            disabled={isDisabled || file === null}
            onChange={handleInputChange}
            InputProps={{
              startAdornment:
                <InputAdornment position='start'>
                  {item.value === ''
                    ? <CreateTwoToneIcon fontSize='small' color='primary' />
                    : !item.isValid
                      ? <ErrorTwoToneIcon fontSize='small' sx={{ color: red[500] }} />
                      : <RadioButtonCheckedIcon fontSize='small' color='secondary' />
                  }
                </InputAdornment>
            }}
          />
        ))}
      </Grid>

      <Grid item xs={12} lg={5}>
        {/** TO-DO: Display the extracted picture from excel file here */}
        &nbsp;
      </Grid>

      <Grid item xs={4} sx={{ marginTop: '12px' }}>
        <Button variant='text' onClick={handleClearClick} disableElevation>
          Clear All
        </Button>
      </Grid>
    </Grid>
  )
}

export default CycloneListComponent
