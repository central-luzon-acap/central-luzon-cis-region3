import { alpha } from '@mui/material'

const styles = {
  profileToolbar: {
    fontSize: '14px'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  logout: {
    cursor: 'pointer'
  },
  list: {
    padding: (theme) => theme.spacing(1),
    '& a': {
      textDecoration: 'none',
      color: ('rgba(0, 0, 0, 0.87)')
    },
    '& .MuiListItemButton-root:hover': {
      backgroundColor: (theme) => theme.palette.primary.light,
    },
    '& .Mui-selected': {
      backgroundColor: (theme) => `${alpha(theme.palette.primary.light, 0.3)} !important`,
    },
    '& .listitembutton-styled': {
      py: 0,
      minHeight: 48,
      color: (theme) => theme.palette.primary.dark,
      borderRadius: (theme) => theme.spacing(1),
      margin: (theme) => theme.spacing(1),
      '&:hover, &:focus': {
        '& .MuiTypography-root': {
          color: (theme) => theme.palette.primary.main
        }
      },
      '& a': {
        color: (theme) => theme.palette.primary.dark
      }
    },
    '& .MuiListItemIcon-root': {
      marginRight: '-8px',
    }
  },
  listitem: {
    '& a': {
      textDecoration: 'none'
    }
  }
}

export default styles
