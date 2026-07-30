const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  cardContainer: {
    display: {
      xs: 'none',
      md: 'grid'
    },
    '& h6': {
      fontSize: '1.2rem',
      lineHeight: '1.6rem'
    },
    '& h6:nth-child(2)': {
      fontWeight: 'bold'
    },
    placeContent: 'center',
    width: '100%',
    maxWidth: '430px',
    minHeight: '85px',
    border: '2px solid #cc00cc',
    borderRadius: '40px',
    padding: (theme) => theme.spacing(2),
    margin: 'auto',
    marginBottom: '6px',
    marginTop: '6px',
    textAlign: 'center',
    boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important'
  },
  arrowIcon: {
    margin: 'auto',
    color: '#cc00cc',
    display: {
      xs: 'none',
      md: 'block'
    }
  }
}

export default styles
