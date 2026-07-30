const styles = {
  breacrumbs: {
    '& a': {
      color: (theme) => theme.palette.secondary.main,
      textDecoration: 'none'
    },
    '& a:visited': {
      color: '#000'
    },
    '& a:hover, span:hover': {
      color: (theme) => theme.palette.primary.dark
    },
    fontSize: '16px',
    marginTop: (theme) => theme.spacing(2)
  }
}

export default styles
