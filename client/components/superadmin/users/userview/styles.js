const styles = {
  container: {
    width: 'parent',
  },
  infoRow: {
    width: 'parent',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    alignItems: 'center',
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    '& div:first-child': {
      color: '#a0a0a0',

    },
    '& div:last-child': {
      color: '#000'
    }
  },
}

export default styles
