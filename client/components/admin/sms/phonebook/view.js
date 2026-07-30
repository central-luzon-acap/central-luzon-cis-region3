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
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import FormGroup from '@mui/material/FormGroup'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import styles from './styles'
import { getError, getHelperText } from './helper'

import useFetchCrops from '@/hooks/cropping_calendar/useFetchCrops'

function ViewContact({
  loadingButton,
  open,
  contact,
  contacts,
  handleClose,
  handleDeleteContact,
  handleEditContact,
  regions
}) {
  const [toEdit, setToEdit] = useState(false)
  const [name, setName] = useState(contact.name)
  const [cellnumber, setCellnumber] = useState(contact.cellnumber)
  const [nickname, setNickname] = useState(contact.nickname)
  const [province, setProvince] = useState(contact.province)
  const [municipality, setMunicipality] = useState(contact.municipality)
  const [municipalities, setMunicipalities] = useState([])
  const [loading, setLoading] = useState(loadingButton)
  const [selectedCrops, setSelectedCrops] = useState(contact.subscribed_crops)

  const provinces = Object.keys(regions)

  const { cropList } = useFetchCrops()

  useEffect(() => {
    setSelectedCrops(contact.subscribed_crops)
  }, [contact])

  useEffect(() => {
    setMunicipalities(regions[province])
  }, [province, regions])

  useEffect(() => {
    setName(contact.name)
    setCellnumber(contact.cellnumber)
    setNickname(contact.nickname)
    setProvince(contact.province)
    setMunicipality(contact.municipality)
  }, [contact])

  useEffect(() => {
    setLoading(loadingButton)
  }, [loadingButton])

  const onChangeName = (event) => {
    setName(event.target.value)
  }

  const onChangeNickname = (event) => {
    setNickname(event.target.value)
  }

  const onChangeCellNumber = (event) => {
    setCellnumber(event.target.value)
  }

  const onChangeProvince = (event) => {
    setProvince(event.target.value)
    setMunicipality('')
  }

  const onChangeMunicipality = (event) => {
    setMunicipality(event.target.value)
  }

  const handleEdit = () => {
    setToEdit(true)
    setCellnumber(contact.cellnumber)
  }

  const handleCancelEdit = () => {
    setName(contact.name)
    setCellnumber(contact.cellnumber)
    setProvince(contact.province)
    setMunicipality(contact.municipality)
    setToEdit(false)
  }

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target
    setSelectedCrops((prevSelectedCrops) =>
      checked
        ? [...prevSelectedCrops, value]
        : prevSelectedCrops.filter((crop) => crop !== value)
    )
  }

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
      <DialogTitle>Contact Details</DialogTitle>
      <DialogContent>
        <Box sx={styles.contactInformationItem}>
          <Box sx={{ mr: 9 }}>
            <DialogContentText>Name:</DialogContentText>
          </Box>
          <TextField
            disabled={!toEdit}
            id="outlined-basic"
            onChange={onChangeName}
            value={name}
            variant="standard"
            size="small"
          />
        </Box>

        <br />

        <Box sx={styles.contactInformationItem}>
          <Box sx={{ mr: 3 }}>
            <DialogContentText>Cell Number:</DialogContentText>
          </Box>
          <TextField
            error={
              getError('EDIT', contacts, cellnumber, contact.cellnumber)
                ?.length > 0
            }
            helperText={getHelperText(
              getError('EDIT', contacts, cellnumber, contact.cellnumber)
            )}
            onChange={onChangeCellNumber}
            disabled={!toEdit}
            id="outlined-basic"
            value={cellnumber}
            variant="standard"
            size="small"
            type="tel"
          />
        </Box>

        <br />

        <Box sx={styles.contactInformationItem}>
          <Box sx={{ mr: 5 }}>
            <DialogContentText>Nickname:</DialogContentText>
          </Box>
          <TextField
            disabled={!toEdit}
            id="outlined-basic"
            onChange={onChangeNickname}
            value={nickname}
            variant="standard"
            size="small"
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
            disabled={!toEdit}
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
            disabled={!toEdit || !Boolean(province)}
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
                      disabled={!toEdit}
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
      <br />
      <DialogActions>
        {toEdit ? (
          <Button
            disabled={
              getError('EDIT', contacts, cellnumber, contact.cellnumber)
                ?.length > 0 || loading
            }
            size="small"
            variant="outlined"
            onClick={() =>
              handleEditContact({
                id: contact.id,
                name,
                cellnumber,
                nickname,
                province,
                municipality,
                selectedCrops
              })
            }
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
        ) : (
          <Button
            disabled={loading}
            size="small"
            variant="outlined"
            onClick={handleEdit}
          >
            EDIT
          </Button>
        )}
        {toEdit ? (
          <Button
            disabled={loading}
            size="small"
            variant="outlined"
            onClick={handleCancelEdit}
          >
            CANCEL
          </Button>
        ) : (
          <Button
            disabled={loading}
            size="small"
            color="error"
            variant="outlined"
            onClick={() => handleDeleteContact(contact)}
          >
            <span
              style={{
                display: loading ? 'none' : 'block',
              }}
            >
              DELETE
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
        )}
        <Button disabled={loading} size="small" onClick={handleClose}>
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewContact
