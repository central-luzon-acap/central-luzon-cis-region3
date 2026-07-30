const styles = {
  wrapper: {
    marginTop: (theme) => theme.spacing(8),
    marginBottom: (theme) => theme.spacing(12)
  },
  autoMuni: {
    marginTop: (theme) => theme.spacing(2)
  },
  card: {
    height: {
      xs: 'unset',
      md: '640px !important'
    },
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important',
    minHeight: '640px',
    minWidth: {
      xs: '200px',
      sm: '500px'
    },
    marginTop: (theme) => theme.spacing(5),
    padding: (theme) => theme.spacing(2),
    borderRadius: (theme) => theme.spacing(1),
    '& h5, h6': {
      marginBottom: (theme) => theme.spacing(2)
    },
  },
  calendar: {
    width: '100%',
    alignItems: 'center',
    '& .cropcal-cropname': {
      fontSize: {
        xs: '9px !important',
        sm: '12px !important',
        md: 'unset !important'
      },
      whiteSpace: {
        xs: 'unset',
        sm: 'nowrap'
      },
    },
    '& .calendar-header-csystem': {
      fontSize: {
        xs: '12px',
        md: '16px'
      },
      textAlign: 'center',
      '& h6': {
        fontSize: {
          xs: '11px',
          sm: 'unset'
        },
      }
    },
    '& .calendar-header-months': {
      display: 'flex',
      fontSize: {
        xs: '11px',
        md: '1rem'
      },
      '& div': {
        width: '100%',
        textAlign: 'center',
      },
      '& .monthlabels': {
        backgroundColor: '#092139',
        color: '#fff',
        padding: {
          xs: '8px 0 8px 0',
          sm: '8px 8px 8px 8px'
        }
      },
    },
    '& .cal-mo-container': {
      height: '32px',
      display: 'flex',
      '& div': {
        width: '100%',
        textAlign: 'center'
      }
    },
    '& .cropCalprep': {
      backgroundColor: '#ffd966'
    },
    '& .cropCalgrow': {
      backgroundColor: '#375623'
    },
    '& .cropCalharv': {
      backgroundColor: '#203764'
    },
    '& .cropCalplant': {
      backgroundColor: '#a9d08e'
    },
    '& .cropCalnocolor, .cropCalbkank': {
      backgroundColor: '#f7f7ff'
    },
    cellBorderColor: {
      'cropCalprep': '#ffd966',
      'cropCalgrow': '#375623',
      'cropCalharv': '#203764',
      'cropCalplant': '#a9d08e',
      'cropCalnocolor': '#f7f7ff',
      'cropCalbkank': 'rgba(0, 0, 0, 0.4)'
    }
  },
  legend: {

    '& ul': {
      listStyle: 'none',
      '& li': {
        marginRight: '10px',
        fontSize: '14px'
      },
      'span': {
        border: '1px solid #ccc',
        float: 'left',
        width: '12px',
        height: '12px',
        margin: '4px',
      }
    }
  },
  errorMsg: {
    fontSize: '12px'
  },
  infoMsg: {
    fontSize: '12px'
  }
}

export default styles
