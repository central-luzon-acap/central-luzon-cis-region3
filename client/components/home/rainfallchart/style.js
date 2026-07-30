const styles = {
  wrapper: {
    width: '100%',
    marginTop: (theme) => theme.spacing(0.5),
    marginBottom: (theme) => theme.spacing(0.5),
  },
  chartRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '4px',
    paddingTop: '8px',
  },
  barColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    height: '100%',
    cursor: 'default',
    '& .bar-day': {
      fontSize: '9px',
      color: 'rgba(0, 0, 0, 0.6)',
      marginTop: '4px',
      whiteSpace: 'nowrap',
    },
  },
  bar: {
    width: '65%',
    minWidth: '10px',
    borderRadius: '3px 3px 0 0',
    transition: 'height 0.2s ease',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: (theme) => theme.spacing(1),
    '& .legend-item': {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '9px',
      color: 'rgba(0, 0, 0, 0.55)',
    },
    '& .legend-swatch': {
      width: '8px',
      height: '8px',
      borderRadius: '2px',
      display: 'inline-block',
    },
  },
}

export default styles
