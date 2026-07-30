const styles = {
  container: {
    marginBottom: '40px',
    paddingTop: '8px',
    fontSize: '14px'
  },
  tablecontainer: {
    border: (theme) => `1px solid ${theme.palette.bacap.border}`,
    borderRadius: (theme) => theme.spacing(1),
    boxShadow: 'rgb(0 0 0 / 2%) 0px 3.5px 5.5px',
  },
  table: {
    width: '100%',
    '& tr': {
      borderBottom: (theme) => `1px solid ${theme.palette.bacap.border}`
    },
    '& tr:last-child': {
      borderBottom: 'none'
    },
    '& td': {
      padding: '10px',
      textAlign: 'center',
      borderLeft: (theme) => `1px solid ${theme.palette.bacap.border}`
    },
    '& td:first-child': {
      borderLeft: 'none'
    },

  },
  tableRowHeader: {
    '& th, td': {
      fontSize: '12px',
      textAlign: 'center',
      lineHeight: theme => theme.spacing(2),
      padding: '2px',
      fontWeight: 500,
      borderTop: 'none'
    }
  },
  miscsystems: {
    fontSize: '12px'
  },
  border: {
    borderRight: (theme) => `1px solid ${theme.palette.bacap.border}`
  },
  itemList: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
}

export default styles
