import { useState } from 'react'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

import RecommendationDialog from './recommendationdialog'
import SimpleSnackbar from '@/components/common/ui/snackbar'
import {
  TENDAY_COLUMNS,
  TENDAY_SMS_COLUMNS,
  SEASONAL_COLUMNS,
  SEASONAL_GENERAL_COLUMNS,
  SEASONAL_SMS_COLUMNS,
  SPECIAL_COLUMNS,
  SPECIAL_SMS_COLUMNS,
} from './recommendation-columns'

import { updateRecommendation } from '@/services/crop_recommendations_v2'

function DataGridRecommendations({ rows, tab, cropType, cropStages, seasonalCropStages }) {
  let recommendationTabColumns = ''
  const [open, setOpen] = useState(false)
  const [selectedRow, setUserSelectedRow] = useState(null)
  const [action, setAction] = useState(null)
  const [message, setMessage] = useState({
    open: false,
    message: '',
    severity: '',
  })

  const handleClose = () => {
    setOpen(false)
  }

  const handleSubmit = async (formJson) => {
    const fieldsToUpdate = [
      'docid',
      'sms',
      'impact_outlook_english',
      'impact_outlook_english',
      'management_recommendations_english',
      'management_recommendations_tagalog',
    ]

    try {
      await updateRecommendation({
        type: tab.value,
        newRecommendation: fieldsToUpdate.reduce(
          (list, field) => ({
            ...list,
            ...(formJson[field] && { [field]: formJson[field] }),
          }),
          {},
        ),
      })
      // setSnackbarOpen(true)
      setMessage({
        open: true,
        message: 'Successfully edited recommendation.',
        severity: 'success',
      })
      window.location.reload()
    } catch (error) {
      setMessage({
        open: true,
        message: error.message || 'Something went wrong.',
        error: error.message,
        severity: 'error',
      })
    }
    handleClose()
  }

  const setSelectedRow = (selected) => {
    setUserSelectedRow({
      ...selected,
      row: {
        ...selected.row,
        crop_stage: cropStages?.[selected.row.crop_stage]?.label,
      },
    })
  }

  switch (tab.value) {
    case 'tenday':
      recommendationTabColumns = TENDAY_COLUMNS(
        cropType,
        setSelectedRow,
        setOpen,
        setAction,
        cropStages,
      )
      break
    case 'tenday_sms':
      recommendationTabColumns = TENDAY_SMS_COLUMNS(
        setSelectedRow,
        setOpen,
        setAction,
      )
      break
    case 'seasonal':
      recommendationTabColumns = SEASONAL_COLUMNS(
        cropType,
        setSelectedRow,
        setOpen,
        setAction,
        seasonalCropStages,
      )
      break
    case 'seasonal_general':
      recommendationTabColumns = SEASONAL_GENERAL_COLUMNS(
        cropType,
        setSelectedRow,
        setOpen,
        setAction,
      )
      break
    case 'seasonal_sms':
      recommendationTabColumns = SEASONAL_SMS_COLUMNS(
        setSelectedRow,
        setOpen,
        setAction,
      )
      break
    case 'special':
      recommendationTabColumns = SPECIAL_COLUMNS(
        setSelectedRow,
        setOpen,
        setAction,
      )
      break
    case 'special_sms':
      recommendationTabColumns = SPECIAL_SMS_COLUMNS(
        setSelectedRow,
        setOpen,
        setAction,
      )
      break
    default:
      recommendationTabColumns = TENDAY_COLUMNS(
        cropType,
        setSelectedRow,
        setOpen,
        setAction,
        cropStages,
      )
      break
  }

  return (
    <div>
      <SimpleSnackbar
        openSnackbar={message.open}
        message={message.message}
        severity={message.severity}
        closeHandlerCB={() => {
          setMessage({ ...message, open: false })
        }}
      />

      <RecommendationDialog
        action={action}
        open={open}
        handleClose={handleClose}
        selectedRow={selectedRow}
        cropType={cropType}
        recommendationType={tab}
        handleSubmit={handleSubmit}
      />

      <Box sx={{ height: 700, width: '100%' }}>
        <DataGrid
          density="compact"
          rows={rows}
          columns={recommendationTabColumns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  )
}

export default DataGridRecommendations
