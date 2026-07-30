const styles = {
  daily: {
    width: {
      xs: '75px',
      sm: '65px'
    },
    minWidth: {
      xs: '75px',
      sm: '65px'
    },
    minHeight: '55px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    padding: (theme) => theme.spacing(1),
    margin: '2px',
    borderRadius: '5px',
    '& div': {
      textAlign: 'center'
    },
    '& .temp-label': {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: {
        xs: '8px',
        sm: '9px'
      }
    },
    '& .daily-date': {
      fontSize: {
        xs: '10px',
        sm: '9px'
      }
    }
  }
}

export default styles
