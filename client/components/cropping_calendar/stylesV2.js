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
    '& .cropCal0': {
      backgroundColor: '#996633'
    },
    '& .cropCal1': {
      backgroundColor: '#CAEDFB'
    },
    '& .cropCal2': {
      backgroundColor: '#DAF2D0'
    },
    '& .cropCal3': {
      backgroundColor: '#B5E6A2'
    },
    '& .cropCal4': {
      backgroundColor: '#8ED973'
    },
    '& .cropCal5': {
      backgroundColor: '#3C7D22'
    },
    '& .cropCal6': {
      backgroundColor: '#104861'
    },
    '& .cropCal7': {
      backgroundColor: '#DC143C'
    },
    '& .cropCal8': {
      backgroundColor: '#4682B4'
    },
    '& .cropCal9': {
      backgroundColor: '#32CD32'
    },
    '& .cropCal10': {
      backgroundColor: '#fcf8e3'
    },
    '& .cropCal11': {
      backgroundColor: '#3498db'
    },
    '& .cropCal12': {
      backgroundColor: '#A1FF33'
    },
    '& .cropCal13': {
      backgroundColor: '#33FFCC'
    },
    '& .cropCal14': {
      backgroundColor: '#ff5733'
    },
    '& .cropCal15': {
      backgroundColor: '#f7ecb5'
    },
    '& .cropCalnocolor, .cropCalbkank': {
      backgroundColor: '#f7f7ff'
    },
    cellBorderColor: {
      'cropCal0': '#996633',
      'cropCal1': '#CAEDFB',
      'cropCal2': '#DAF2D0',
      'cropCal3': '#B5E6A2',
      'cropCal4': '#8ED973',
      'cropCal5': '#3C7D22',
      'cropCal6': '#104861',
      'cropCal7': '#DC143C',
      'cropCal8': '#4682B4',
      'cropCal9': '#32CD32',
      'cropCal10': '#fcf8e3',
      'cropCal11': '#3498db',
      'cropCal12': '#A1FF33',
      'cropCal13': '#33FFCC',
      'cropCal14': '#ff5733',
      'cropCal15': '#f7ecb5',
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
