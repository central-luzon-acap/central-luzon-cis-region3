const styles = {
  wrapper: {
    marginTop: (theme) => theme.spacing(10)
  },
  container: {
    padding: (theme) => theme.spacing(2),
    paddingTop: (theme) => theme.spacing(2),
    marginBottom: (theme) => theme.spacing(4),
    display: 'flex',
    flexDirection: {
      xs: 'column',
      sm: 'row'
    }
  }
}

export default styles
