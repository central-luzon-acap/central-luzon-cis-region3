const styles = {
  profileContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  profileCard: {
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
    minWidth: '0px',
    overflowWrap: 'break-word',
    background: '#FFFFFF',
    boxShadow: 'rgb(0 0 0 / 2%) 0px 3.5px 5.5px',
    borderRadius: '15px',
    maxWidth: '600px',
    margin: 'auto',
    borderColor: '#E2E8F0'
  },
  textfield: {
    marginTop: (theme) => theme.spacing(3)
  },
  button: {
    marginTop: (theme) => theme.spacing(2),
    width: '200px'
  }
}

export default styles
