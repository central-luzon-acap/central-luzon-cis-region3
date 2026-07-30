const styles = {
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    boxShadow: 'rgb(209, 154, 154) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important',
    minWidth: {
      xs: '200px',
      sm: '380px'
    },
    maxWidth: '380px',
    maxHeight: '350px',
    marginTop: (theme) => theme.spacing(3),
    padding: (theme) => theme.spacing(2),
    borderRadius: (theme) => theme.spacing(1.5),
    overflow: 'auto',
    '& h5': {
      marginBottom: (theme) => theme.spacing(2),
      fontSize: '18px'
    },
    '& h6': {
      fontSize: '16px',
      fontWeight: 700
    },
    '& .span-source': {
      '& a': {
        color: theme => theme.palette.primary.main,
        textDecoration: 'none'
      },
      '& a:hover': {
        color: theme => theme.palette.third.main
      }
    }
  },
  glanceCard: {
    background: 'linear-gradient(135deg, #2b3a55 0%, #3f6b4f 100%)',
    color: '#fff',
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 10px 15px -3px',
    minWidth: {
      xs: '200px',
      sm: '380px'
    },
    maxWidth: '380px',
    marginTop: (theme) => theme.spacing(3),
    padding: (theme) => theme.spacing(2),
    borderRadius: (theme) => theme.spacing(1.5),
    '& h5': {
      marginBottom: (theme) => theme.spacing(1.5),
      fontSize: '15px',
      fontWeight: 600,
      opacity: 0.85,
      letterSpacing: '0.3px'
    },
    '& .MuiAutocomplete-root .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      color: '#fff',
      borderRadius: (theme) => theme.spacing(1)
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.3)'
    },
    '& .MuiSvgIcon-root': {
      color: '#fff'
    }
  },
  outlookHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: (theme) => theme.spacing(0.5)
  },
  advisoryBox: {
    marginTop: (theme) => theme.spacing(1.5),
    paddingTop: (theme) => theme.spacing(1),
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
    '& .advisory-title': {
      fontSize: '13px',
      fontWeight: 700,
      marginBottom: (theme) => theme.spacing(0.5)
    },
    '& .advisory-line': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      color: 'rgba(0, 0, 0, 0.65)',
      padding: '2px 0'
    },
    '& .advisory-icons': {
      display: 'flex',
      gap: '6px',
      '& svg': {
        fontSize: '15px',
        color: theme => theme.palette.primary.main
      }
    }
  },
  marketCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important',
    minWidth: {
      xs: '200px',
      sm: '380px'
    },
    maxWidth: '380px',
    marginTop: (theme) => theme.spacing(1.25),
    padding: (theme) => theme.spacing(2),
    borderRadius: (theme) => theme.spacing(1.5),
    '& h6': {
      fontSize: '15px',
      fontWeight: 700,
      marginBottom: (theme) => theme.spacing(1)
    },
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '12px'
    },
    '& th': {
      textAlign: 'left',
      color: 'rgba(0, 0, 0, 0.5)',
      fontWeight: 500,
      paddingBottom: '4px'
    },
    '& td': {
      padding: '2px 0',
      fontWeight: 600
    },
    '& .up': {
      color: '#2e7d32'
    },
    '& .down': {
      color: '#c62828'
    }
  },
  cardInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important',
    width: '100%',
    maxWidth: '490px',
    padding: (theme) => theme.spacing(1),
    marginTop: (theme) => theme.spacing(3),
    fontSize: {
      xs: '11px',
      sm: '14px'
    },
    '& td': {
      padding: {
        xs: 0,
        xs: '1px'
      }
    }
  },
  autocomplete: {
    maxWidth: '100%',
    marginTop: (theme) => theme.spacing(1)
  },
  weathertoday: {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  '& .icon-temp': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    position: 'absolute',
    right: '20px',
    top: '60px'
  },
  '& .temperature': {
    fontSize: '32px',
    fontWeight: 'bold'
  },
  '& .weather-details': {
    paddingTop: '0',
    marginLeft: '0',
    fontSize: '12px',
    lineHeight: '1.6',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }

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
