const styles = {
  container: {
    maxWidth: (theme) => theme.breakpoints.values.sm,
    marginTop: (theme) => theme.spacing(7),
    border: '1px solid #484848',
    borderRadius: (theme) => theme.spacing(1),
    padding: (theme) => theme.spacing(2)
  },
  wrapper: {
    marginTop: (theme) => theme.spacing(10)
  },
  dataContainer: {
    marginTop: (theme) => theme.spacing(4)
  },
  dataContent: {
    '& div': {
      padding: (theme) => theme.spacing(2),
    },
    '.data-content-description': {
      backgroundColor: 'rgba(0, 0, 0, 0.03)',
    }
  },
  dataContentDescriptionText: {
    padding: (theme) => theme.spacing(2),
    '& .windsignalcontent': {
      marginBottom: (theme) => theme.spacing(3)
    }
  },
  summary: {
    margin: 0,
    padding: 0,
    height: '100%'
  }
}

export default styles
