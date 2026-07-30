const styles = {
  searchbar: {
    width: {
      xs: '205px',
      smol: '245px',
      b4xs: '380px',
    },
    minWidth: 'parent',
    borderRadius: '5px',
    backgroundColor: '#fff',
    '& .MuiAutocomplete-option': {
      backgroundColor: 'red !important',
      color: 'blue'
    }
  },
  textfield: {
    '& .MuiOutlinedInput-root': {
      '& > fieldset': {
        border: 'none !important'
      }
    }
  },
  listbox: {
    maxHeight: '500px',
    '& li': {
      borderRadius: '6px',
      marginTop: '8px'
    },
    '& :hover': {
      '& h6, svg': {
        color: (theme) => theme.palette.secondary.main
      }
    }
  },
  paperbg: {
    borderRadius: '6px',
    boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important',
    marginTop: '-2px',
    padding: '8px',
    border: '1px solid rgba(0, 0, 0, 0.12)'
  }
}

export default styles
