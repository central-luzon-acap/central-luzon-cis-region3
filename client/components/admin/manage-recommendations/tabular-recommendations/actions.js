import Box from '@mui/material/Box'

import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import EditIcon from '@mui/icons-material/Edit'

function Actions({ params, setSelectedRow, setOpen, setAction }) {
  const handleOpenDialog = (action) => {
    setSelectedRow(params)
    setOpen(true)
    setAction(action)
  }

  return (
    <Box
      sx={{
        m: 1,
        position: 'relative',
      }}
    >
      <RemoveRedEyeIcon
        color="primary"
        sx={{
          '&:hover': { cursor: 'pointer' },

          marginRight: '16px',
        }}
        onClick={() => handleOpenDialog('View')}
      />
      <EditIcon
        color="primary"
        sx={{
          '&:hover': { cursor: 'pointer' },
        }}
        onClick={() => handleOpenDialog('Edit')}
      />
    </Box>
  )
}

export default Actions
