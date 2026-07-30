const styles = {
  button: {
    '& a, span': {
      color: (theme) => theme.palette.primary.light,
      textDecoration: 'none'
    },
    '& a:visited': {
      color: (theme) => theme.palette.primary.light
    },
    '& a:hover': {
      color: '#fff'
    },
    '& span:hover': {
      color: '#fff'
    },
    fontSize: 12
  },
  buttonSide: {
    '& a': {
      color: (theme) => theme.palette.text.primary,
      textDecoration: 'none'
    },
    '& a:visited': {
      color: '#000'
    },
    '& a:hover, span:hover': {
      color: (theme) => theme.palette.primary.main
    },
  },
  buttonSelectedNav: {
    // backgroundColor: (theme) => theme.palette.primary.dark,
    // color: 'red',
    '& a, span': {
      color: (theme) => theme.palette.third.main,
      textDecoration: 'none'
    },
    '& a:visited': {
      color: (theme) => theme.palette.third.main,
    },
    fontSize: 12
  },
  buttonSelectedSide: {
    color: (theme) => theme.palette.third.main,
    '& a': {
      color: (theme) => theme.palette.third.main,
      textDecoration: 'none'
    },
    '& a:visited': {
      color: (theme) => theme.palette.third.main,
    }
  },
  subButtonSelected: {
    '& a, span': {
      color: (theme) => theme.palette.text.primary,
      textDecoration: 'none',
      textAlign: 'left',
      textTransform: 'capitalize',
      fontWeight: 'normal',
      fontSize: 16
    },
    '& a:visited': {
      color: '#000'
    },
    '& a:hover, span:hover': {
      color: (theme) => theme.palette.secondary.main
    },
    width: '100%',
    justifyContent: 'flex-start'
  },
  dropMainButton: {
    '& a, span': {
      color: (theme) => theme.palette.secondary.main,
      textDecoration: 'none',
      textAlign: 'left',
      textTransform: 'capitalize',
      fontWeight: 'normal',
      fontSize: 12
    },
    '& a:visited': {
      color: '#000'
    },
    width: '100%',
    justifyContent: 'flex-start'
  },
  menuContainerRegular: {
    width: '100% !important',
    display: { xs: 'block' },
    '& .MuiPaper-root': {
      borderTop: (theme) => `5px solid ${theme.palette.third.main}`,
      minWidth: '270px',
      boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important'
    }
  }
}

export default styles
