const styles = {
  tablecontainer: {
    marginTop: (theme) => theme.spacing(1),
    border: (theme) => `1px solid ${theme.palette.bacap.border}`,
    borderRadius: (theme) => theme.spacing(1),
    boxShadow: 'rgb(0 0 0 / 2%) 0px 3.5px 5.5px',
  },
  table: {
    '& td': {
      border: (theme) => `1px solid ${theme.palette.bacap.border}`,
    }
  },
  headerMonths: {
    textAlign: 'center',
    borderBottom: 'none',
    borderLeft: (theme) => `1px solid ${theme.palette.bacap.border}`
  },
  headerSub: {
    width: '5%',
    borderLeft: (theme) => `1px solid ${theme.palette.bacap.border}`
  },
  tablecell: {
    border: '1px solid',
    textAlign: 'center'
  },
  subheader: {
    marginBottom: (theme) => theme.spacing(3),
    maxWidth: '800px',
    color: 'gray',
    '& a': {
      textDecoration: 'none',
      color: (theme) => theme.palette.green.dark
    },
    '& a:hover': {
      textDecoration: 'underline'
    },
    '& a:visited': {
      color: (theme) => theme.palette.green.dark
    }
  },
  labels: {
    fontSize: '12px',
    color: (theme) => theme.palette.secondary.light
  },
  legend: {
    margin: (theme) => theme.spacing(1),
    fontSize: '14px',
    display: 'flex',
    flexDirection: {
      xs: 'column',
      sm: 'row'
    },
    justifyContent: 'space-between',
    alignItems: {
      xs: 'flex-start',
      sm: 'baseline'
    },
    '& ul': {
      listStyle: 'none',
      '& li': {
        // float: 'right',
        marginRight: '10px'
      },
      'span': {
        border: '1px solid #ccc',
        float: 'left',
        width: '12px',
        height: '12px',
        margin: '4px',
      }
    },
    '& .wb_normal': {
      backgroundColor: 'red',
      color: '#fff'
    },
    '& .b_normal': {
      backgroundColor: 'yellow'
    },
    '& .near_normal': {
      backgroundColor: '#00c300'
    },
    '& .above_normal': {
      backgroundColor: 'blue',
      color: '#fff'
    }
  },
  tableRowHeader: {
    '& th, td': {
      fontSize: '11px',
      textAlign: 'center',
      lineHeight: theme => theme.spacing(2),
      padding: '2px',
      fontWeight: 500,
      borderTop: 'none'
    },
    '& td': {
      border: 'none'
    },
    '& td:nth-child(3n)': {
      borderRight: '1px solid rgb(226, 232, 240)'
    },
    '& td:last-child': {
      borderRight: 'none'
    },
    '& td:first-child': {
      borderLeft: '1px solid rgb(226, 232, 240)'
    }
  },
  cellData: {
    '& td:first-child': {
      fontSize: '12px',
      textAlign: 'left',
      borderLeft: 'none',
      padding: '6px 16px 6px 16px'
    },
    '& td:last-child': {
      borderRight: 'none'
    },
    '& td': {
      fontSize: '11px',
      textAlign: 'center',
      padding: '10px',
      color: 'rgba(0, 0, 0, 0.87)',
      border: '1px solid rgb(226, 232, 240)'
    }
  }
}

export default styles
