import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import ButtonGroup from '@mui/material/ButtonGroup'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import FileInput from '@/common/ui/fileuploader/fileinput'
import WindSignalForm from '@/domain/admin/settings/windsignal/windsignalform'
import ModalDialogWrapper from '@/components/common/ui/modal'
import EndButton from '@/components/common/ui/fileuploader/endbutton'
import PaperBgSoft from '@/components/common/ui/paperbgsoft'
import PaperBg from '@/components/common/ui/paperbg'
import SimpleSnackbar from '@/components/common/ui/snackbar'
import CaptionText from '@/components/common/ui/captiontext'
import EmptyState from '@/components/common/ui/empty_state'
import { APP_STATES } from '@/utils/constants/app'
import { ADAPTER_STATES } from '@/store/constants'
import { REGION_NAME } from '@/utils/constants'
import { red } from '@mui/material/colors'
import styles from './styles'

import CreateTwoToneIcon from '@mui/icons-material/CreateTwoTone'
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ClearIcon from '@mui/icons-material/Clear'


function WindSignalListComponent ({
  state,
  appstate,
  message,
  windsignalitems,
  updateinfo,
  onConfirmClick,
  onCancelClick,
  onLocationItemChange,
  handleInputChange,
  handleAddClick,
  handleClearClick,
  handleDeleteClick,
  handleDeleteProvince,
  handleReset,
  handleSaveClick,
  handleAppState,
  currentItem,
}) {
  const pLoading = useSelector((state) => state.provinces.status)
  const mLoading = useSelector((state) => state.municipalities.status)
  const [isDisabled, setIsDisabled] = useState(true)
  const [signalNum, setSignalNum] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    const disabled = pLoading === ADAPTER_STATES.PENDING ||
      mLoading === ADAPTER_STATES.PENDING ||
      message.saving

    setIsDisabled(disabled)
  }, [pLoading, mLoading, message.saving])

  const toggleForm = (index) => {
    setIsFormOpen(prev => !prev)
    setSignalNum(index)
  }

  return (
    <Box sx={{ minWidth: '300px', width: '100%', marginTop: '40px' }}>
      <Typography variant='h6'>
        Wind Speed List Editor
      </Typography>

      {/** Notification Snackbar */}
      {message.MSG !== '' &&
        <SimpleSnackbar
          openSnackbar
          message={message.MSG}
          severity={message.TYPE}
        />
      }

      {/** Modal Input Form */}
      <ModalDialogWrapper
        openButtonText={null}
        maxWidth='sm'
        title={message.TITLE}
        loading={message.saving}
        contentText={appstate !== APP_STATES.EDIT
          ? message.MODAL_MSG
          : null
        }
        modalConfirmHandlerCB={() => {
          switch(appstate) {
            case APP_STATES.EDIT:
              setIsFormOpen(prev => !prev)
              onConfirmClick(signalNum)
              break
            case APP_STATES.SAVE:
              handleSaveClick()
              break
            default:
              break
          }
        }}
        modalCancelHandlerCB={() => {
          setIsFormOpen(prev => !prev)
          onCancelClick()
        }}
        isOpen={appstate === APP_STATES.EDIT
          ? isFormOpen && message.openLoadingModal
          : message.openLoadingModal
        }
      >
        {appstate === APP_STATES.EDIT &&
          <WindSignalForm
            item={currentItem}
            signalNum={signalNum}
            onItemChange={onLocationItemChange}
          />
        }
      </ModalDialogWrapper>

      <Grid item xs={12} md={4}>
        <Grid container spacing={3}>
          {state.length === 0
            ? <Grid item xs={12} lg={7}>
                <EmptyState
                  message="There are no wind signal data. Encode wind signal data now for future viewing."
                  style={{ marginTop: '16px' }}
                />
              </Grid>
            : <Grid item xs={12} lg={7}>
              {state.map((main, index) => (
                <PaperBg sx={{ marginTop: '16px' }} key={index}>
                  {/** Wind Signal Textbox Input */}
                  <FileInput
                    key={index}
                    id={`wsignal-${index}`}
                    size='small'
                    label={main.full}
                    value={main.value}
                    disabled={isDisabled}
                    placeholder='Enter a wind signal number'
                    sx={styles.rowItem}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment:
                        <InputAdornment position='start'>
                          {main.value === ''
                            ? <CreateTwoToneIcon fontSize='small' color='primary' />
                            : !main.isValid
                              ? <ErrorTwoToneIcon fontSize='small' sx={{ color: red[500] }} />
                              : <RadioButtonCheckedIcon fontSize='small' color='secondary' />
                          }
                        </InputAdornment>,
                      endAdornment:
                        <ButtonGroup disableElevation>
                          <EndButton
                            size='small'
                            disabled={main.value === '' || !main.isValid || isDisabled}
                            sx={{ width: '80px', borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}
                            onClick={() => {
                              toggleForm(main.value)
                              handleAppState(APP_STATES.EDIT, index)
                            }}
                          >
                            Edit
                          </EndButton>
                          <EndButton
                            startIcon={<ClearIcon fontSize='small' />}
                            sx={styles.btnCancel}
                            onClick={() => handleDeleteClick(index, main.value)}
                            disabled={isDisabled}
                          />
                        </ButtonGroup>
                    }}
                  />

                  {/** Provinces and Municipalities List */}
                  {windsignalitems.map((itm, idx) => {
                    if (itm.signal === parseInt(main.value)) {
                      return <PaperBgSoft key={`itm-${idx}`} sx={styles.listContainer}>
                        <Box>
                          <Typography variant='body1'>
                            <strong>{itm.province.label}</strong>
                          </Typography>
                          <Typography variant='body2'>
                            ({itm.municipalities.map(m => m.label).toString().split(',').join(', ')})
                          </Typography>
                        </Box>
                        <Box>
                          <EndButton
                            sx={styles.btnCancel}
                            startIcon={<DeleteForeverIcon fontSize='small' />}
                            disabled={isDisabled}
                            onClick={() => {
                              handleDeleteProvince(parseInt(main.value), itm.province.label)
                            }}
                          />
                        </Box>
                      </PaperBgSoft>
                    }
                  })}
                </PaperBg>
              ))}
              </Grid>
          }

          <Grid item xs={12} lg={5}>
            <PaperBgSoft sx={{ width: 'parent', marginTop: '16px' }}>
              <CaptionText sx={{ fontWeight: 400, fontSize: '0.875rem', lineHeight: '1.43', letterSpacing: '0.01071em', color: 'rgba(0, 0, 0, 0.6)' }}>
                Encode wind speed for hand-picked {REGION_NAME} provinces and municipalities here. This data will be display on ACAP&quot;s Special Weather Forecast section and used as reference on the Tropical Cyclone bulletins, if a typhoon will be detected from PAGASA&quot;s web page.
              </CaptionText>
            </PaperBgSoft>

            <PaperBgSoft sx={{ width: 'parent', marginTop: '16px' }}>
              <CaptionText>
                {updateinfo}
              </CaptionText>
            </PaperBgSoft>
          </Grid>
        </Grid>
      </Grid>

      {/** ButtonGroup Panel */}
      <Grid item xs={12} sx={{ marginTop: '40px' }}>
        <ButtonGroup
          variant='text'
          disableElevation
          size='small'
          sx={styles.btnGroup}
          disabled={isDisabled}
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
          <EndButton onClick={() => {
            setIsFormOpen(prev => !prev)
            handleAppState(APP_STATES.SAVE)
          }} variant='contained'>
            Save
          </EndButton>
        </ButtonGroup>
      </Grid>
    </Box>
  )
}

export default WindSignalListComponent
