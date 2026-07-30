const styles = {
  listItem: {
    '& a': {
      color: (theme) => theme.palette.text.primary,
      textDecoration: 'none'
    },
    '& a:hover': {
      color: (theme) => theme.palette.third.main,
      textDecoration: 'none'
    }
  },
}

export default styles
