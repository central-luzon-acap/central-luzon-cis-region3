const styles = {
  selectionSummary: {
    minWidth: '100%',
    paddingLeft: {
      xs: 0,
      lg: '16px',
    }
  },
  welcome: {
    border: '1px solid #DCEDC8',
    borderRadius: (theme) => theme.spacing(1),
    width: '100%',
    display: 'grid',
    placeContent: 'center',
    padding: '20px',
    marginTop: (theme) => theme.spacing(1),
    textAlign: 'center',
    '& h6': {
      lineHeight: '20px'
    },
  },
  summary: {
    border: '1px solid #DCEDC8',
    borderRadius: (theme) => theme.spacing(1),
    marginTop: (theme) => theme.spacing(1),
    padding: (theme) => theme.spacing(3),
  }
}

export default styles
