const styles = {
  container: {
    padding: '24px',
    width: '100%',
    position: 'relative',
    minWidth: '0px',
    overflowWrap: 'break-word',
    background: '#FFFFFF',
    boxShadow: 'rgb(0 0 0 / 2%) 0px 3.5px 5.5px',
    borderRadius: '16px',
    borderColor: '#E2E8F0',
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
  },
  selectionSummary: {
    minWidth: '100%',
    paddingLeft: {
      xs: 0,
      lg: '16px',
    }
  },
  headerText: {
    marginBottom: '32px',
     width: '100%',
     display: 'flex',
     justifyContent: 'space-between',
     alignItems: 'top'
  },
  conditionLegend: {
    borderRadius: (theme) => theme.spacing(1),
    width: '100%',
    padding: (theme) => theme.spacing(1),
    border: '1px solid grey',
    textAlign: 'center',
    boxShadow: 'rgb(0 0 0 / 2%) 0px 3.5px 5.5px',
    float: 'left'
  },
  autocomplete: {
    marginTop: (theme) => theme.spacing(1),
  },
  recSeasonal: {
    marginTop: (theme) => theme.spacing(1),
    marginBottom: (theme) => theme.spacing(5),
    '& p, ul, ol': {
      fontSize: '14px',
    },
  },
  recSeasonalStage: {
    marginTop: (theme) => theme.spacing(5),
    marginBottom: (theme) => theme.spacing(2),
    textDecoration: 'underline'
  },
  button: {
    color: '#FFFFFF',
    textTransform: 'capitalize',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 'normal',
    width: '80px',
    height: {
      xs: '40px',
      sm: '48px',
    },
  },
  pdfcontent: {
    ul: {
      paddingLeft: 3
    }
  },
}

export default styles
