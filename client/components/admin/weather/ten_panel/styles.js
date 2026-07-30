const styles = {
  subheader: (theme) => ({
    marginBottom: theme.spacing(2),
    color: 'gray',
    marginTop:  theme.spacing(1),
    '& a': {
      color: theme.palette.green.dark,
      textDecoration: 'none'
    },
    '& a:visited': {
      color: theme.palette.green.dark
    },
    '& a:hover, span:hover': {
      textDecoration: 'underline'
    }
  }),
  summary: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '500px',
    minHeight: '100px',
    border: '1px solid gray',
    borderRadius: '8px',
    marginTop: (theme) => theme.spacing(1),
    marginBottom: (theme) => theme.spacing(3),
    '& ul': {
      listStyle: 'none'
    }
  },
  upload: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '500px',
    minHeight: '90px',
    border: '1px solid gray',
    borderRadius: '8px',
    fontSize: '14px',
    color: (theme) => theme.palette.text.secondary,
    padding: (theme) => theme.spacing(2),
    marginTop: (theme) => theme.spacing(1),
    marginBottom: (theme) => theme.spacing(1),
  },
  notification: {
    maxWidth: '500px',
    marginBottom: (theme) => theme.spacing(2)
  }
}

export default styles
