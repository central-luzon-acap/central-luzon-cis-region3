const styles = {
  container: {
    marginTop: theme => theme.spacing(3)
  },
  text: {
    color: 'gray',
    marginBottom: (theme) => theme.spacing(1),
    marginTop: (theme) => theme.spacing(1)
  },
  rowItem: {
    display: 'flex',
    marginTop: '16px',
    maxWidth: {
      xs: '100%',
      sm: '300px'
    }
  },
  btnGroup: {
    '& button': {
      width: '110px'
    },
    display: {
      sm: 'flex',
      md: 'unset'
    },
    flexDirection: {
      sm: 'column'
    }
  }
}

export default styles
