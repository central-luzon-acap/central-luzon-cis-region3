const styles = {
  container: {
    width: 'parent',
    display: 'flex',
    flexDirection: 'column',
    '& .MuiTextField-root, button': {
      marginTop: (theme) => theme.spacing(2)
    }
  },
  formlabel: {
    fontSize: '12px',
    marginTop: (theme) => theme.spacing(3),
    marginBottom: '4px'
  },
  selectBox: {
    marginBottom: (theme) => theme.spacing(2)
  }
}

export default styles
