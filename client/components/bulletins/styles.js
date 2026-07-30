const styles = {
  container: {
    marginTop: (theme) => theme.spacing(8)
  },
  card: {
    height: '100%',
    boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important',
    '& a': {
      color: (theme) => theme.palette.primary.main,
      textDecoration: 'none'
    },
    alignItems: 'baseline'
  },
}

export default styles
