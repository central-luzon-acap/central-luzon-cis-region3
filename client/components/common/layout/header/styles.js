const styles = {
  container: (theme) => ({
    display: {
      md: 'flex'
    },
    [theme.breakpoints.down('lg')]: {
      color: theme.palette.primary.main,
      paddingLeft: 0,
      paddingRight: 0,
    },
  }),
  appbar: {
    width: '100%',
    minHeight: '36px',
    borderBottom: (theme) => `4px solid ${theme.palette.third.main}`,
    backgroundColor: (theme) => ({
      md: theme.palette.primary.light,
      lg: theme.palette.primary.main
    })
  },
  toolbar: {
    width: '100%',
    justifyContent: {
      sm: 'space-between',
      md: 'end'
    },
    alignItems: {
      xs: 'flex-start',
      sm: 'center'
    },
    backgroundColor: (theme) => theme.palette.primary.main,
    flexDirection: {
      xs: 'column',
      sm: 'row'
    },
    color: (theme) => theme.palette.primary.light,
    paddingTop: {
      xs: '4px'
    },
    padding: {
      lg: '3px 0 3px'
    },
    paddingRight: {
      xs: 0,
      md: '8px'
    },
    height: 'parent'
  },
  titleContainerFixed: (theme) => ({
    position: 'fixed',
    zIndex: '999',
    left: 0,
    top: 0,
    width: {
      xs: 'unset',
      md: '320px',
    },
    [theme.breakpoints.down('980')]: {
      width: '300px'
    },
    marginRight: {
      xs: '24px',
      md: 'unset'
    },
    cursor: 'pointer',
    alignItems: 'center',
  }),
  titleContainer: (theme) => ({
    width: {
      xs: 'unset',
      md: '400px',
    },
    [theme.breakpoints.down('980')]: {
      width: '300px'
    },
    marginRight: {
      xs: '24px',
      md: 'unset'
    },
    cursor: 'pointer',
    alignItems: 'center',
  }),
  titleTextDesktop: {
    display: 'grid',
    placeContent: 'center',
    '& h5': {
      fontSize: '16px'
    },
    '& h4': {
      fontSize: '12px'
    }
  },
  title: {
    backgroundColor: (theme) => ({
      md: theme.palette.primary.light
    }),
    width: {
      sm: '100%',
    },
    display: {
      xs: 'none',
      md: 'flex'
    },
    justifyContent: {
      sm: 'center'
    },
    '& span:first-child': { // next/image ACAP logo
      width: {
        xs: '50px !important',
        md: '50px !important'
      },
      display: {
        xs: 'none !important',
        md: 'block !important'
      }
    },
    gap: {
      xs: '12px',
      md: '12px'
    },
    '& h5, h4': (theme) => ({
      fontFamily: 'Roboto',
      fontSize: {
        xs: '1rem',
        md: '1.25rem'
      },
      lineHeight: {
        xs: '1.07',
        md: '1'
      },
      fontWeight: {
        xs: 'normal',
        md: 'bold'
      },
      textTransform: 'uppercase',
      textAlign: 'center',
      color: {
        md: theme.palette.primary.main
      },
      [theme.breakpoints.down('980')]: {
        fontSize: '16px',
        fontWeight: 'bold'
      },
      margin: 0,
      whiteSpace: 'nowrap'
    }),
    '& h4': {
      color: {
        md: (theme) => theme.palette.primary.main
      },
      fontWeight: 'normal',
      fontSize: {
        xs: '0.875rem',
        md: '1rem'
      },
      marginTop: {
        xs: '1px',
        md: '2px'
      }
    },
    height: '100%',
    padding: {
      md: '8px 16px 8px 0'
    }
  },
  subtitleLink: {
    fontFamily: 'Antonio',
    textTransform: 'uppercase',
    color: '#DCEDC8',
    cursor: 'pointer',
    display: {
      sm: 'block',
      md: 'none'
    }
  },
  menuContainerSmall: {
    width: '100% !important',
    display: { xs: 'block', md: 'none' },
    '& .MuiPaper-root': {
      boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important'
    }
  },
  menuContainerRegular: {
    width: '100% !important',
    minWidth: '300px',
    display: { xs: 'block' },
    '& .MuiPaper-root': {
      boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important'
    }
  },
}

export default styles
