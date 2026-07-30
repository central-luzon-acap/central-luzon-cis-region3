const styles = {
  container: {
    marginTop: theme => theme.spacing(3)
  },
  text: {
    color: 'gray',
    marginBottom: (theme) => theme.spacing(1),
    marginTop: (theme) => theme.spacing(1)
  },
  rowItem: {
    display: 'flex',
    marginTop: '12px',
    maxWidth: 'parent',
    '& .MuiOutlinedInput-root': {
    paddingLeft: theme => theme.spacing(2)
    }
  },
  btnCancel: {
    height: theme => theme.spacing(5),
    width: '40px',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    '& span': {
      marginRight: 0
    }
  },
  btnGroup: {
    marginTop: '8px',
    '& button': {
      width: '110px'
    },
    display: {
      sm: 'flex',
      md: 'unset'
    },
    flexDirection: {
      sm: 'column'
    }
  }
}

export default styles
