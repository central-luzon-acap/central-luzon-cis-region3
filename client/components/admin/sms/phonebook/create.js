import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material/'
import InputLabel from '@mui/material/InputLabel'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import FormGroup from '@mui/material/FormGroup'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import styles from './styles'
import { getError, getHelperText } from './helper'

import useFetchCrops from '@/hooks/cropping_calendar/useFetchCrops'

function AddContact({
  contacts,
  open,
  handleClose,
  handleAddContact,
  loadingButton,
  regions,
  province,
  setProvince,
  municipality,
  setMunicipality
}) {
  const [name, setName] = useState('')
  const [cellnumber, setCellnumber] = useState(null)
  const [nickname, setNickname] = useState('')
  // const [province, setProvince] = useState('')
  // const [municipality, setMunicipality] = useState('')
  const [municipalities, setMunicipalities] = useState([])
  const [selectedCrops, setSelectedCrops] = useState([])
  const [loading, setLoading] = useState(loadingButton)

  const provinces = Object.keys(regions)

  const { cropList } = useFetchCrops()

  useEffect(() => {
    setLoading(loadingButton)
  }, [loadingButton])

  useEffect(() => {
    if (Boolean(province)) {
      setMunicipalities(regions[province])
    }

  }, [province, regions])

  const onChangeName = (event) => {
    setName(event.target.value)
  }

  const onChangeNickname = (event) => {
    setNickname(event.target.value)
  }

  const onChangeCellnumber = (event) => {
    setCellnumber(event.target.value)
  }

  const onChangeProvince = (event) => {
    setProvince(event.target.value)
    setMunicipality('')
  }

  const onChangeMunicipality = (event) => {
    setMunicipality(event.target.value)
  }

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target
    setSelectedCrops((prevSelectedCrops) =>
      checked
        ? [...prevSelectedCrops, value]
        : prevSelectedCrops.filter((crop) => crop !== value)
    )
  }

  const handleSave = () => {
    handleAddContact({
      name,
      cellnumber,
      nickname,
      province,
      municipality,
      subscribed_crops: selectedCrops
    })
    setName('')
    setCellnumber(null)
    setProvince('')
    setMunicipality('')
    handleClose()
  }

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
      <DialogTitle>Add Contact</DialogTitle>
      <DialogContent>
        <Box sx={styles.contactInformationItem}>
          <Box sx={{ mr: 9 }}>
            <DialogContentText>Name:</DialogContentText>
          </Box>
          <TextField
            id="outlined-basic"
            variant="standard"
            size="small"
            onChange={onChangeName}
          />
        </Box>

        <br />

        <Box sx={styles.contactInformationItem}>
          <Box sx={{ mr: 3 }}>
            <DialogContentText>Cell Number:</DialogContentText>
          </Box>
          <TextField
            error={getError('ADD', contacts, cellnumber, null)?.length > 0}
            helperText={getHelperText(getError('ADD', contacts, cellnumber))}
            id="outlined-basic"
            variant="standard"
            size="small"
            onChange={onChangeCellnumber}
            type="tel"
          />
        </Box>

        <br />

        <Box sx={styles.contactInformationItem}>
          <Box sx={{ mr: 5 }}>
            <DialogContentText>Nickname:</DialogContentText>
          </Box>
          <TextField
            id="outlined-basic"
            variant="standard"
            size="small"
            onChange={onChangeNickname}
          />
        </Box>

        <br />

        <FormControl variant="standard" fullWidth>
          <InputLabel id="demo-simple-select-label">Select Province</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={province}
            label="Province"
            onChange={onChangeProvince}
          >
            {provinces.map((province) => {
              return <MenuItem key={province} value={province}>{province}</MenuItem>
            })}
          </Select>
        </FormControl>

        <br /><br />

        <FormControl variant="standard" fullWidth>
          <InputLabel id="demo-simple-select-label">Select Municipality</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={municipality}
            label="Municipality"
            onChange={onChangeMunicipality}
            disabled={!Boolean(province)}
          >
            {municipalities.map((municipality) => {
              return <MenuItem key={municipality} value={municipality}>{municipality}</MenuItem>
            })}
          </Select>
        </FormControl>

        <br /><br />

        <FormControl>
          <FormLabel id="demo-checkbox-group-label">Subscribed Crops</FormLabel>
          <Typography variant="caption">Select crops where farmer wants to receive SMS.</Typography>
          <FormGroup row>
            {cropList.length ? (
              cropList.map((crop) => (
                <FormControlLabel
                  key={crop}
                  control={
                    <Checkbox
                      value={crop}
                      checked={selectedCrops.includes(crop)}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label={crop}
                />
              ))
            ) : (
              <p>No data available.</p>
            )}
          </FormGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} size="small" onClick={handleClose}>
          CANCEL
        </Button>
        <Button
          disabled={
            getError('ADD', contacts, cellnumber)?.length > 0 ||
            cellnumber === null ||
            province.length === '' ||
            municipality.length === '' ||
            !(nickname.length > 0 && nickname.length <= 5) ||
            selectedCrops.length === 0 ||
            loading
          }
          size="small"
          variant="contained"
          onClick={handleSave}
        >
          <span
            style={{
              display: loading ? 'none' : 'block',
            }}
          >
            SAVE
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
    </Dialog>
  )
}

export default AddContact
