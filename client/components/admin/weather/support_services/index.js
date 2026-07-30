import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

import SimpleSnackbar from '@/common/ui/snackbar'

import { REGIONAL_FIELD_OFFICE } from '@/utils/constants'

import { useState, useEffect } from 'react'
import useSupportServices from '@/hooks/support_services/usesupportservices'

import {
  addSupportService,
  updateSupportService,
  deleteSupportService,
} from '@/services/support_services'

function SupportServices() {
  const defaultSnackbarState = { message: '', severity: 'success' }
  const [service, setService] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingService, setEditingService] = useState('')
  const [snackbar, setSnackbar] = useState(defaultSnackbarState)
  const { services, loading, error } = useSupportServices(service, isLoading)

  const handleServiceChange = (event) => {
    setService(event.target.value)
  }

  useEffect(() => {
    setIsLoading(loading || isLoading)
  }, [loading, isLoading])

  const addService = async () => {
    if (!service) return
    try {
      setIsLoading(true)
      await addSupportService({ supportService: service })
      setSnackbar({
        message: 'Successfully added a new support service.',
        severity: 'success',
      })
      setService('')
      setIsLoading(false)
      setTimeout(() => setSnackbar(defaultSnackbarState), 1500)
    } catch (err) {
      setSnackbar({
        message: 'Something went wrong.',
        severity: 'error',
      })
      setIsLoading(false)
      setTimeout(() => setSnackbar(defaultSnackbarState), 1500)
      throw new Error(err)
    }
  }

  const handleEditSupportService = (index, service) => {
    setEditingIndex(index)
    setEditingService(service.data)
  }

  const handleDeleteSupportService = async (supportServiceId) => {
    if (!supportServiceId) return
    try {
      setIsLoading(true)
      await deleteSupportService(supportServiceId)
      setSnackbar({
        message: 'Successfully deleted a support service.',
        severity: 'success',
      })
      setService('')
      setIsLoading(false)
      setTimeout(() => setSnackbar(defaultSnackbarState), 1500)
    } catch (err) {
      setSnackbar({
        message: 'Something went wrong.',
        severity: 'error',
      })
      setIsLoading(false)
      setTimeout(() => setSnackbar(defaultSnackbarState), 1500)
      throw new Error(err)
    }
  }

  const handleSaveClick = async (service) => {
    try {
      setIsLoading(true)
      await updateSupportService({
        data: editingService,
        docId: service.docId,
        date: new Date(),
      })
      setSnackbar({
        message: 'Successfully updated a support service.',
        severity: 'success',
      })
      setEditingIndex(null)
      setEditingService('')
      setIsLoading(false)
      setTimeout(() => setSnackbar(defaultSnackbarState), 1500)
    } catch (err) {
      setSnackbar({
        message: 'Something went wrong.',
        severity: 'error',
      })
      setIsLoading(false)
      setTimeout(() => setSnackbar(defaultSnackbarState), 1500)
      throw new Error(err)
    }
  }

  const handleCancelClick = () => {
    setEditingIndex(null)
    setEditingService('')
  }

  return (
    <Box sx={{ '& li': { fontSize: '14px' } }}>
      <Typography sx={{ marginTop: (theme) => theme.spacing(1) }} variant="h6">
        DA RFO {REGIONAL_FIELD_OFFICE} Support Services
      </Typography>

      <div
        style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
      >
        <TextField
          style={{ width: '75%' }}
          id="outlined-basic"
          label="Add Support Service"
          variant="outlined"
          size="small"
          value={service}
          onChange={handleServiceChange}
          disabled={isLoading}
        />
        {isLoading ? (
          <CircularProgress size={24} color="primary" />
        ) : (
          <Button
            disableElevation
            variant="contained"
            disabled={!service}
            onClick={addService}
          >
            ADD
          </Button>
        )}
      </div>

      <Grid>
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <>
            {error ? (
              <p>Something went wrong.</p>
            ) : (
              <>
                {services.length ? (
                  <List>
                    {services.map((service, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemButton disabled={isLoading}>
                          <ListItemText
                            primary={
                              editingIndex === index ? (
                                <TextField
                                  value={editingService}
                                  onChange={(e) =>
                                    setEditingService(e.target.value)
                                  }
                                  label="Edit Support Service"
                                  variant="outlined"
                                  size="small"
                                  multiline
                                  style={{ width: '75%' }}
                                />
                              ) : (
                                service.data
                              )
                            }
                          />
                          <div
                            style={{
                              display: 'flex',
                              justifyItems: 'center',
                            }}
                          >
                            {editingIndex === index ? (
                              <span>
                                <ListItemIcon>
                                  <CheckIcon
                                    color="primary"
                                    onClick={() => handleSaveClick(service)}
                                  />
                                </ListItemIcon>

                                <ListItemIcon>
                                  <CloseIcon
                                    color="primary"
                                    onClick={handleCancelClick}
                                  />
                                </ListItemIcon>
                              </span>
                            ) : (
                              <ModeEditIcon
                                color="primary"
                                onClick={() =>
                                  handleEditSupportService(index, service)
                                }
                              />
                            )}
                          </div>
                          {editingIndex !== index && (
                            <ListItemIcon>
                              <DeleteOutlineIcon
                                color="primary"
                                disabled={isLoading}
                                onClick={() =>
                                  handleDeleteSupportService(service.docId)
                                }
                              />
                            </ListItemIcon>
                          )}
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <p>No data available.</p>
                )}
              </>
            )}
          </>
        )}
      </Grid>

      <SimpleSnackbar
        openSnackbar={snackbar.message !== ''}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  )
}

export default SupportServices
