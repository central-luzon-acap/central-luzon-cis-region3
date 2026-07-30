const styles = {
  container: {
    marginTop: (theme) => theme.spacing(3),
    minHeight: '400px'
  },
  controls: {
    marginTop: (theme) => theme.spacing(6)
  },
  selectContainer: {
    borderRight: {
      sm: 'none',
      md: '1px solid gray'
    }
  },
  recsContainer: {
    marginTop: '-24px',
    paddingLeft: {
      sm: 'none',
      md: '54px !important'
    },
    '& .toggleButton': {
      float: 'right',
      width: '80px'
    }
  },
  autocomplete: {
    maxWidth: {
      xs: '100%',
      md: '300px'
    },
    paddingTop: (theme) => theme.spacing(2)
  },
  conditionLegend: {
    maxWidth: {
      sm: '100%'
    },
    margin: {
      md: '24px'
    },
    marginBottom: '32px',
    padding: (theme) => theme.spacing(1),
    borderRadius: '4px',
    border: '1px solid grey',
    textAlign: 'center'
  },
  welcome: {
    display: 'grid',
    placeContent: 'center',
    marginTop: (theme) => theme.spacing(10),
    textAlign: 'center',
    '& h5': {
      marginTop: (theme) => theme.spacing(2)
    }
  }
}

export default styles
