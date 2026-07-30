import Actions from '../actions'

import { changeCodeToLabel } from '@/utils/recommendations'

const TENDAY_COLUMNS = (cropType, setSelectedRow, setOpen, setAction, cropStages) => {
  return [
    {
      field: '',
      headerName: '',
      type: 'actions',
      renderCell: (params) => params.api.getRowIndex(params.id) + 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      renderCell: (params) => (
        <Actions
          params={params}
          setSelectedRow={setSelectedRow}
          setOpen={setOpen}
          setAction={setAction}
        />
      ),
    },
    { field: 'crop', headerName: 'Crop', width: 100 },
    {
      field: 'crop_stage',
      headerName: 'Crop Stage',
      width: 200,
      renderCell: (params) => {
        return cropStages?.[params.value]?.label
      },
    },
    {
      field: 'farming_activity',
      headerName: 'Farming Activity',
      width: 170,
    },
    {
      field: 'climate_risk',
      headerName: 'Climate Risk',
      width: 150,
      renderCell: (params) => {
        return changeCodeToLabel(params.field, params.value, cropType)
      },
    },
    {
      field: 'impact_outlook_english',
      headerName: 'Impact Outlook English',

      width: 200,
    },
    {
      field: 'impact_outlook_tagalog',
      headerName: 'Impact Outlook Tagalog',

      width: 200,
    },
    {
      field: 'management_recommendations_english',
      headerName: 'Management Recommendations English',

      width: 300,
    },
    {
      field: 'management_recommendations_tagalog',
      headerName: 'Management Recommendations Tagalog',

      width: 300,
    },
  ]
}

const TENDAY_SMS_COLUMNS = (setSelectedRow, setOpen, setAction) => {
  return [
    {
      field: '',
      headerName: '',
      type: 'actions',
      renderCell: (params) => params.api.getRowIndex(params.id) + 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      renderCell: (params) => (
        <Actions
          isSMS={true}
          params={params}
          setSelectedRow={setSelectedRow}
          setOpen={setOpen}
          setAction={setAction}
        />
      ),
    },
    { field: 'crop', headerName: 'Crop', width: 100 },
    {
      field: 'climate_risk',
      headerName: 'Climate Risk',
      width: 170,
      renderCell: (params) => {
        return changeCodeToLabel(params.field, params.value, null)
      },
    },
    {
      field: 'sms',
      headerName: 'SMS',
      width: 500,
    },
  ]
}

const SEASONAL_COLUMNS = (cropType, setSelectedRow, setOpen, setAction, cropStages) => {
  return [
    {
      field: '',
      headerName: '',
      type: 'actions',
      renderCell: (params) => params.api.getRowIndex(params.id) + 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      renderCell: (params) => (
        <Actions
          params={params}
          setSelectedRow={setSelectedRow}
          setOpen={setOpen}
          setAction={setAction}
        />
      ),
    },
    { field: 'crop', headerName: 'Crop', width: 100 },
    {
      field: 'crop_stage',
      headerName: 'Crop Stage',
      width: 200,
      renderCell: (params) => {
        return cropStages?.[params.value]?.label
      },
    },
    {
      field: 'farming_activity',
      headerName: 'Farming Activity',
      width: 170,
    },
    {
      field: 'climate_risk',
      headerName: 'Climate Risk',
      width: 150,
      renderCell: (params) => {
        return changeCodeToLabel(params.field, params.value, cropType)
      },
    },
    {
      field: 'impact_outlook_english',
      headerName: 'Impact Outlook English',

      width: 200,
    },
    {
      field: 'impact_outlook_tagalog',
      headerName: 'Impact Outlook Tagalog',

      width: 200,
    },
    {
      field: 'management_recommendations_english',
      headerName: 'Management Recommendations English',

      width: 300,
    },
    {
      field: 'management_recommendations_tagalog',
      headerName: 'Management Recommendations Tagalog',

      width: 300,
    },
  ]
}

const SEASONAL_GENERAL_COLUMNS = (cropType, setSelectedRow, setOpen, setAction) => {
  return [
    {
      field: '',
      headerName: '',
      type: 'actions',
      renderCell: (params) => params.api.getRowIndex(params.id) + 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      renderCell: (params) => (
        <Actions
          params={params}
          setSelectedRow={setSelectedRow}
          setOpen={setOpen}
          setAction={setAction}
        />
      ),
    },
    { field: 'crop', headerName: 'Crop', width: 100 },
    {
      field: 'climate_risk',
      headerName: 'Climate Risk',
      width: 150,
      renderCell: (params) => {
        return changeCodeToLabel(params.field, params.value, cropType)
      },
    },
    {
      field: 'impact_outlook_english',
      headerName: 'Impact Outlook English',

      width: 200,
    },
    {
      field: 'impact_outlook_tagalog',
      headerName: 'Impact Outlook Tagalog',

      width: 200,
    },
    {
      field: 'management_recommendations_english',
      headerName: 'Management Recommendations English',

      width: 300,
    },
    {
      field: 'management_recommendations_tagalog',
      headerName: 'Management Recommendations Tagalog',

      width: 300,
    },
  ]
}

const SEASONAL_SMS_COLUMNS = (setSelectedRow, setOpen, setAction) => {
  return [
    {
      field: '',
      headerName: '',
      type: 'actions',
      renderCell: (params) => params.api.getRowIndex(params.id) + 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      renderCell: (params) => (
        <Actions
          isSMS={true}
          params={params}
          setSelectedRow={setSelectedRow}
          setOpen={setOpen}
          setAction={setAction}
        />
      ),
    },
    { field: 'crop', headerName: 'Crop', width: 100 },
    {
      field: 'climate_risk',
      headerName: 'Climate Risk',
      width: 170,
      renderCell: (params) => {
        return changeCodeToLabel(params.field, params.value, null)
      },
    },
    {
      field: 'sms',
      headerName: 'SMS',
      width: 500,
    },
  ]
}

const SPECIAL_COLUMNS = (setSelectedRow, setOpen, setAction) => {
  return [
    {
      field: '',
      headerName: '',
      type: 'actions',
      renderCell: (params) => params.api.getRowIndex(params.id) + 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      renderCell: (params) => (
        <Actions
          params={params}
          setSelectedRow={setSelectedRow}
          setOpen={setOpen}
          setAction={setAction}
        />
      ),
    },
    { field: 'crop', headerName: 'Crop', width: 100 },
    {
      field: 'wind_signal',
      headerName: 'Wind Signal',
      width: 170,
      renderCell: (params) => {
        return changeCodeToLabel(params.field, params.value, null)
      },
    },
    {
      field: 'impact_outlook_english',
      headerName: 'Impact Outlook English',

      width: 200,
    },
    {
      field: 'impact_outlook_tagalog',
      headerName: 'Impact Outlook Tagalog',

      width: 200,
    },
    {
      field: 'management_recommendations_english',
      headerName: 'Management Recommendations English',

      width: 300,
    },
    {
      field: 'management_recommendations_tagalog',
      headerName: 'Management Recommendations Tagalog',

      width: 300,
    },
  ]
}

const SPECIAL_SMS_COLUMNS = (setSelectedRow, setOpen, setAction) => {
  return [
    {
      field: '',
      headerName: '',
      type: 'actions',
      renderCell: (params) => params.api.getRowIndex(params.id) + 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      renderCell: (params) => (
        <Actions
          isSMS={true}
          params={params}
          setSelectedRow={setSelectedRow}
          setOpen={setOpen}
          setAction={setAction}
        />
      ),
    },
    { field: 'crop', headerName: 'Crop', width: 100 },
    {
      field: 'wind_signal',
      headerName: 'Wind Signal',
      width: 170,
      renderCell: (params) => {
        return changeCodeToLabel(params.field, params.value, null)
      },
    },
    {
      field: 'sms',
      headerName: 'SMS',
      width: 500,
    },
  ]
}

export {
  TENDAY_COLUMNS,
  TENDAY_SMS_COLUMNS,
  SEASONAL_COLUMNS,
  SEASONAL_GENERAL_COLUMNS,
  SEASONAL_SMS_COLUMNS,
  SPECIAL_COLUMNS,
  SPECIAL_SMS_COLUMNS,
}
