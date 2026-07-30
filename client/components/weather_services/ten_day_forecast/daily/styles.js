const styles = {
  daily: {
    width: '107px',
    minWidth: '107px',
    minHeight: '170px',
    backgroundColor: 'rgba(139, 195, 74, 0.3)',
    // backgroundColor: 'rgba(174, 192, 139, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    margin: '2px',
    borderRadius: '5px',
    '& div': {
      textAlign: 'center'
    },
    '& .temp-day': {
      margin: '4px 0 4px 0',
    },
    '& .temp-label': {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      margin: '4px'
    },
    '& .temp-weather-icons': {
      backgroundColor: '#fff',
      paddingTop: '8px'
    }
  }
}

export default styles
