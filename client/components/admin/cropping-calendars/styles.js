const styles = {
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
  container: {
    padding: '24px',
    width: '100%',
    position: 'relative',
    minWidth: '0px',
    overflowWrap: 'break-word',
    background: '#FFFFFF',
    boxShadow: 'rgb(0 0 0 / 2%) 0px 3.5px 5.5px',
    borderRadius: '16px',
    margin: 'auto',
    borderColor: '#E2E8F0',
  },
  tabsContainer: {
    marginTop: (theme) => theme.spacing(8),
    border: (theme) => `1px solid ${theme.palette.bacap.border}`,
    minHeight: '800px',
    borderRadius: '8px',
    background: '#FFFFFF',
    boxShadow: 'rgb(0 0 0 / 2%) 0px 3.5px 5.5px',
  },
  customizedButtonLink: {
    cursor: 'pointer',
    color: '#8BC24A',
    textDecoration: 'underline',
    fontWeight: 600,
  },
  subheader: {
    marginBottom: (theme) => theme.spacing(3),
    maxWidth: '800px',
    color: 'gray',
    '& a': {
      textDecoration: 'none',
      color: (theme) => theme.palette.green.dark
    },
    '& a:hover': {
      textDecoration: 'underline'
    },
    '& a:visited': {
      color: (theme) => theme.palette.green.dark
    }
  },
}

export default styles
