import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import SearchIcon from '@mui/icons-material/Search'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import styles from './styles'

function SearchBar ({ search, options, currentval, onSelectItemChange, handleSearchClick, onTextChange }) {
  function Background (props) {
    return <Paper elevation={5} {...props} sx={styles.paperbg} />
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Autocomplete
        disablePortal
        id='search-key'
        value={currentval}
        options={options}
        getOptionLabel={(option) => option.label}
        filterOptions={x => x}
        sx={styles.searchbar}
        style={{ display: (search) ? 'block' : 'none' }}
        size='small'
        PaperComponent={Background}
        ListboxProps={{
          sx: styles.listbox
        }}
        noOptionsText='No results found.'
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onInputChange={onTextChange}
        onChange={(e, newValue) => onSelectItemChange(e, { ...newValue })}
        renderOption={(props, option) => (
          <li {...props}>
            <Box display={'flex'} flexDirection={'row'}>
              <option.icon size={'24'} />
              <Box display={'flex'} ml={3} flexDirection={'column'}>
                <Typography variant='subtitle1' color={'text.primary'}>
                  <strong>{option.label}</strong>
                </Typography>
                <Typography variant='body2' color={'text.secondary'}>
                  {option.info}
                </Typography>
              </Box>
            </Box>
          </li>
        )}
        renderInput={(params) =>
          <TextField
            {...params}
            autoFocus={true}
            focused
            placeholder='Search'
            sx={styles.textfield}
            inputRef={input => input && input.focus()}
        />}
      />
      <IconButton
        size='large'
        aria-label='Search button'
        aria-controls='menu-appbar'
        aria-haspopup='true'
        onClick={handleSearchClick}
        color='inherit'
        sx={styles.searchicon}
      >
        {(!search)
          ? <SearchIcon />
          : <CancelOutlinedIcon />
        }
      </IconButton>
    </Box>
  )
}

export default SearchBar
