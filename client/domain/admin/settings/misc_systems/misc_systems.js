import ButtonGroup from '@mui/material/ButtonGroup'
import EndButton from '@/common/ui/fileuploader/endbutton'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import FileInput from '@/common/ui/fileuploader/fileinput'
import Typography from '@mui/material/Typography'
import ModalDialogWrapper from '@/common/ui/modal'
import SimpleSnackbar from '@/common/ui/snackbar'
import CaptionText from '@/common/ui/captiontext'
import { red } from '@mui/material/colors'
import styles from './styles'

import CreateTwoToneIcon from '@mui/icons-material/CreateTwoTone'
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import ClearIcon from '@mui/icons-material/Clear'

function MiscSystemsListComponent ({
  state,
  message,
  log,
  isLoading,
  handleInputChange,
  handleDeleteClick,
  handleClearClick,
  handleReset,
  handleAddClick,
  handleSaveClick,
  handleCancelSaveClick,
  handleResetMsg,
  onSaveClick,
}) {
  return (
    <Grid container sx={styles.container}>
      {(message.openLoadingModal) &&
        <ModalDialogWrapper
          isOpen
          title='Save changes'
          contentText={message.modalMsg}
          loading={isLoading}
          openButtonText={null}
          modalConfirmHandlerCB={onSaveClick}
          modalCancelHandlerCB={handleCancelSaveClick}
        />
      }

      {message.msg !== '' &&
        <SimpleSnackbar
          openSnackbar
          message={message.msg}
          severity={message.type}
          closeHandlerCB={handleResetMsg}
        />
      }

      <Grid item xs={12} sx={{ marginTop: '24px', marginBottom: '8px' }}>
        {/** No. of Tropical Cyclone input */}
        <Typography variant='h6'>
          Weather Systems that May Affect the Region
        </Typography>
        <Typography variant='body2' sx={styles.text}>
          Below is a list of other weather systems that may affect the region. Edit the existing contents or add/delete some items,<br />then press the <strong>SAVE</strong> button to save your changes. <br /><br />Press the <strong>RESET</strong> button to undo your changes to the last SAVE point. Press the <strong>CLEAR ALL</strong> button to remove all items.
        </Typography>

        <CaptionText>
          {isLoading
            ? 'Loading...'
            : `Updated by ${log.updated_by} on ${log.date_created}.`
          }
        </CaptionText>
      </Grid>

      <Grid item xs={12} lg={6}>
        {state.map((item, index) => (
          <FileInput
            key={index}
            id={`misc-${index}`}
            size='small'
            label={item.full}
            value={item.value}
            placeholder='Enter a weather system'
            sx={styles.rowItem}
            disabled={isLoading}
            onChange={handleInputChange}
            InputProps={{
              startAdornment:
                <InputAdornment position='start'>
                  {item.value === ''
                    ? <CreateTwoToneIcon fontSize='small' color='primary' />
                    : !item.isValid
                      ? <ErrorTwoToneIcon fontSize='small' sx={{ color: red[500] }} />
                      : <RadioButtonCheckedIcon fontSize='small' color='secondary' />
                  }
                </InputAdornment>,
              endAdornment:
                <EndButton
                  disableElevation
                  disabled={isLoading}
                  startIcon={<ClearIcon fontSize='small' />}
                  sx={styles.btnCancel}
                  onClick={() => handleDeleteClick(index)}
                />
            }}
          />
        ))}
      </Grid>

      <Grid item xs={12} lg={5}>
        {/** TO-DO: Display the extracted picture from excel file here */}
        &nbsp;
      </Grid>

      <Grid item xs={12} sx={{ marginTop: '24px' }}>
        <ButtonGroup
          variant='text'
          disableElevation
          size='small'
          sx={styles.btnGroup}
          disabled={isLoading}
        >
          <EndButton onClick={handleClearClick}>
            Clear All
          </EndButton>
          <EndButton onClick={handleReset}>
            Reset
          </EndButton>
          <EndButton onClick={handleAddClick}>
            Add
          </EndButton>
          <EndButton onClick={handleSaveClick} variant='contained'>
            Save
          </EndButton>
        </ButtonGroup>
      </Grid>
    </Grid>
  )
}

export default MiscSystemsListComponent
