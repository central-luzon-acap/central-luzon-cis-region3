const reportStyles = {
  htmlReportHR: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: '1.5',
    flexShrink: 0,
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderBottomWidth: 'thin',
    margin: '48px 0 48px 0'
  },
  details: {
    maxWidth: {
      md: '60%',
      sm: '100%'
    },
    '& div': {
      marginBottom: '4px'
    },
    '& p': {
      color: (theme) => theme.palette.grey[800]
    }
  },
  content: {
    '& h2': {
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontWeight: 400,
      fontSize: '1.5rem',
      lineHeight: 1.334,
      letterSpacing: '0em',
      textDecoration: 'underline'
    },
    '& h3': {
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
      color: 'rgba(0, 0, 0, 0.67)'
    },
    '& li': {
      fontSize: '14px'
    }
  }
}

export default reportStyles
