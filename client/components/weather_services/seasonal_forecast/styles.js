const styles = {
  wrapper: {
    marginTop: (theme) => theme.spacing(6)
  },
  container: {
    maxWidth: (theme) => theme.breakpoints.values.sm,
    marginTop: (theme) => theme.spacing(1),
    border: '1px solid #484848',
    borderRadius: (theme) => theme.spacing(1)
  },
  table: {
    minWidth: '350px',
  },
  tableTitle: {
    textAlign: 'center'
  },
  cells: {
    '& td, th': {
      textAlign: 'center'
    }
  },
  caption: {
    color: (theme) => theme.palette.text.secondary,
    '& a': {
      color: (theme) => theme.palette.secondary.main,
      textDecoration: 'none'
    },
    '& a:visited': {
      color:  (theme) => theme.palette.primary.dark
    },
    '& a:hover, span:hover': {
      textDecoration: 'underline'
    },
  }
}

export default styles
