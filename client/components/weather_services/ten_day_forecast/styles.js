const styles = {
  wrapper: {
    marginTop: (theme) => theme.spacing(8),
    marginBottom: (theme) => theme.spacing(12)
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important',
    minHeight: '390px',
    minWidth: {
      xs: '200px',
      sm: '500px'
    },
    // maxWidth: '500px',
    marginTop: (theme) => theme.spacing(3),
    padding: (theme) => theme.spacing(2),
    borderRadius: (theme) => theme.spacing(1),
    '& h5, h6': {
      marginBottom: (theme) => theme.spacing(2)
    }
  },
  autocomplete: {
    maxWidth: '100%',
    marginTop: (theme) => theme.spacing(1)
  },
  autoMuni: {
    marginTop: (theme) => theme.spacing(2)
  },
  info: {
    minWidth: '285px',
    minHeight: '90px',
    padding: (theme) => theme.spacing(2),
    marginTop: (theme) => theme.spacing(2),
    textAlign: 'center',
    '& p': {
      color: 'red',
      fontSize: '12px'
    }
  }
}

export default styles
