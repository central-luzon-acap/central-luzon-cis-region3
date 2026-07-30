const styles = {
  footer: {
    width: '100%',
    color: '#fff',
    minHeight: (theme) => theme.spacing(1),
    padding: (theme) => theme.spacing(1),
    backgroundColor: '#F5F6F7'
  },
  gridItem: {
    '& div': {
      '& span': {
        marginLeft: '2px !important',
        marginRight: '2px !important'
      }
    }
  },
  links: {
    color: '#000',
    maxWidth: '1200px',
    margin: 'auto',
    '& a': {
      color: (theme) => theme.palette.primary.main,
      textDecoration: 'none'
    },
    '& a:visited': {
      color: (theme) => theme.palette.primary.main,
      textDecoration: 'none'
    },
    '& a:hover': {
      color: (theme) => theme.palette.third.main,
      textDecoration: 'underline'
    },
    '& ul': {
      padding: '0 16px 0 8px',
      listStyleType: '"\\00BB"',
      '& li': {
        paddingLeft: '6px',
        fontSize: '12px',
      }
    }
  }
}

export default styles
