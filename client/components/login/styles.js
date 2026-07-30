const styles = {
  container: {
    width: '100%',
    display: 'grid',
    minHeight: '50vh',
    placeItems: 'center'
  },
  loginContainer: {
    width: {
      xs: '100%',
      sm: '400px',
    },
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    padding: (theme) => theme.spacing(1),
    '& .MuiTextField-root, button': {
      marginTop: (theme) => theme.spacing(2)
    },
    '& h5': {
      marginBottom: (theme) => theme.spacing(2)
    },
    '& svg': {
      fontSize: '45px',
      margin: 'auto',
      marginBottom: '8px'
    }
  },
  btnContainer: {
    display: 'flex',
    gap: 3,
    '& button': {
      flexGrow: 1
    }
  }
}

export default styles
