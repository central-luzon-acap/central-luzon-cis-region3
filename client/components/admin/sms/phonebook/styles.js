const styles = {
  phonebookContainer: {
    border: (theme) => `1px solid ${theme.palette.bacap.border}`,
    minHeight: '500px',
    maxHeight: '500px',
    borderRadius: '8px',
    background: '#fafafa',
    boxShadow: 'rgb(0 0 0 / 2%) 0px 3.5px 5.5px',
    overflow: 'auto',
  },
  searchPhonebookTextField: {
    width: '170px',
    margin: 1,
    background: '#FFFFFF',
    position: 'absolute',
    zIndex: 1,
  },
  contactInformationItem: {
    display: 'flex',
    alignItems: 'baseline',
  },
}

export default styles
