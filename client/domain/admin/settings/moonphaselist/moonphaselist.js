import Box from '@mui/material/Box'
import EndButton from '@/common/ui/fileuploader/endbutton'
import ButtonGroup from '@mui/material/ButtonGroup'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ModalDialogWrapper from '@/common/ui/modal'
import SimpleSnackbar from '@/common/ui/snackbar'
import CaptionText from '@/common/ui/captiontext'
import PhaseItem from './phaseitem'
import { red } from '@mui/material/colors'
import styles from './styles'

import CreateTwoToneIcon from '@mui/icons-material/CreateTwoTone'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone'

function MoonPhaseListComponent ({
  state,
  message,
  log,
  isDisabled,
  isViewInfo,
  handleInputChange,
  handleClearClick,
  handleSaveClick,
  handleCancelSaveClick,
  handleSwitchClick,
  onSaveClick
}) {
  return (
    <Grid container sx={styles.container}>
      {(message.openLoadingModal) &&
        <ModalDialogWrapper
          isOpen
          title='Save changes'
          contentText={message.modalMsg}
          loading={isDisabled}
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
          closeHandlerCB={handleCancelSaveClick}
        />
      }

      <Grid item xs={12} sx={{ marginTop: '32px' }}>
        {/** No. of Tropical Cyclone input */}
        <Typography variant='h6'>
          Moon Phases Input
        </Typography>
        <Typography variant='body2' sx={styles.text}>
          Listed below are the moon phases data for the 10-Day weather outlook PDF moon phases section.<br />
          Click the <strong>EDIT</strong> button to start editing it&apos;s content.
        </Typography>

        <CaptionText>
          Updated by {log.updated_by} on {log.date_created} from PAGASA&apos;s <a href='https://www.pagasa.dost.gov.ph/astronomy/astronomical-diary' target='_blank' rel="noreferrer">Astronomical Diary</a> web page.
        </CaptionText>
      </Grid>

      {/** Moon Phases List */}
      <Grid item xs={12} lg={7} sx={{ marginTop: '8px' }}>
        {isViewInfo
          ? state.map((item, index) => (
            <PhaseItem
              key={index}
              text={item.value}
              label={item.label}
              imagePath={item.image}
            />
          ))
          : state.map((item, index) => (
            <TextField
              key={index}
              id={`month-${index}`}
              size='small'
              label={item.label}
              value={item.value}
              placeholder={`${item.label} date i.e., 29-Jun-22`}
              sx={styles.rowItem}
              disabled={isDisabled}
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
                  </InputAdornment>
              }}
            />
          ))
        }

        {/** Control Buttons */}
        <Box sx={{ marginTop: '24px', marginLeft: '8px' }}>
          <ButtonGroup
            variant='text'
            size='small'
            disabled={isDisabled}
            disableElevation
            sx={styles.btnGroup}
          >
            {isViewInfo
              ? <>
                <EndButton variant='contained' onClick={handleSwitchClick}>
                  Edit
                </EndButton>
                </>
              : <>
                <EndButton onClick={handleClearClick}>
                  Clear All
                </EndButton>
                <EndButton onClick={handleSwitchClick}>
                  Cancel
                </EndButton>
                <EndButton variant='contained' onClick={handleSaveClick} disabled={isDisabled}>
                  Save
                </EndButton>
                </>
            }

          </ButtonGroup>
        </Box>
      </Grid>
    </Grid>
  )
}

export default MoonPhaseListComponent
