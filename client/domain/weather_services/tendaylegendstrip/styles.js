const styles = {
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    height: 'inherit',
    '& h6': {
      marginBottom: {
        xs: 'auto',
        sm: 'unset'
      }
    }
  },
  iconCard: {
    padding: '2px 6px 2px 6px',
    borderRadius: 1,
    height: '100%',
    width: '62px',
    margin: {
      xs: '2px',
      xs2: '4px',
    },
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    '& span': {
      lineHeight: 'initial',
      fontSize: '11px'
    }
  },
  cardsContainer: {
    display: 'flex',
    height: '78px'
  },
  imgContainer: {
    margin: 'auto',
    marginTop: {
      xs: 'inherit',
      sm: 0
    },
    marginBottom: {
      xs: 'inherit',
      sm: 0
    },
    height: {
      xs: '30px',
      sm: '45px'
    },
    width: {
      xs: '30px',
      sm: '45px'
    }
  }
}

export default styles
