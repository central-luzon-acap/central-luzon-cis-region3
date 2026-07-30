const styles = {
  button: {
    color: '#FFFFFF',
    // backgroundColor: (theme) => theme.palette.third.main,
    textTransform: 'capitalize',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 'normal',
    height: {
      xs: '40px',
      sm: '48px'
    },
    '& .text': {
      display: {
        xs: 'block',
        sm: 'none'
      }
    },
    '& .shortText': {
      display: {
        xs: 'inline-block',
        sm: 'none'
      },
      fontSize: '24px'
    },
  },
  icon: {
    display: {
      xs: 'block',
      sm: 'none'
    }
  },
  dialogContent: {
    '& .error': {
      fontSize: '12px',
      color: 'red'
    }
  },
  dialogActions: {
    '& button': {
      minWidth: '100px'
    }
  },
  closeButton: {
    position: 'absolute',
    right: '8px',
    top: '8px',
    color: (theme) => theme.palette.grey[500]
  }
}

export default styles
