import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  Grid,
  // TextField,
  Typography,
} from '@mui/material/'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
// import { DataGrid } from '@mui/x-data-grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useRouter } from 'next/router'
import { sendSMS } from '@/services/sms'
import LoadingDocument from '@/common/ui/loadingdocument'
import EmptyState from '@/common/ui/empty_state'
import ModalDialogWrapper from '@/common/ui/modal'
import { REPORT_TITLE } from '@/utils/constants/app'
import { REPORT } from '@/hooks/reports/constants'
import styles from './styles'
import stylesReport from '@/domain/admin/bulletins/report/styles'

import useReportFields from '@/hooks/reports/usereportfields'

import { createTheme, ThemeProvider } from '@mui/material/styles'
const theme = createTheme()

theme.typography.h5 = {
  fontSize: '1.2rem',
  '@media (min-width:600px)': {
    fontSize: '1.5rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '2rem',
  },
}

function ViewSendSMS({
  contacts,
  contactsState,
  onBackBtnClick,
  report,
  setReport,
  loading,
}) {
  const [selectedMunicipality, setSelectedMunicipality] = useState(null)
  const [groupedContacts, setGroupedContacts] = useState(null)
  const [contactIds, setContactIds] = useState([])
  const router = useRouter()

  const { fieldValues } = useReportFields(report, [
    REPORT.REGION,
    REPORT.TYPE,
    REPORT.UID,
    REPORT.ID,
  ])

  useEffect(() => {
    if (contacts.length !== 0) {
      groupContacts(
        contacts.filter((contact) =>
          contact.subscribed_crops.includes(report.crop),
        ),
      )
    }
  }, [contacts, report.crop, groupContacts])

  const handleSelectProvince = (event, province, municipality) => {
    const _municipality = event.target.checked ? municipality : null
    if (!_municipality) return
    setSelectedMunicipality(_municipality)
    const numbersOnly = groupedContacts[province][municipality].map(
      (item) => item.cellnumber,
    )
    setContactIds(numbersOnly)
  }

  const groupContacts = useCallback(
    (contacts) => {
      const data = contacts.reduce((result, item) => {
        // Group by province
        if (!result[item.province]) {
          result[item.province] = {}
        }

        // Group by municipality within each province
        if (!result[item.province][item.municipality]) {
          result[item.province][item.municipality] = []
        }

        // Add the item to the corresponding municipality group
        if (item.subscribed_crops.includes(report.crop)) {
          result[item.province][item.municipality].push(item)
        }

        return result
      }, {})

      setGroupedContacts(data)
    },
    [report.crop, setGroupedContacts],
  )

  const isScreenSizeBetweenXSandMD = useMediaQuery(
    theme.breakpoints.between('xs', 'md'),
  )

  const handleSend = async () => {
    if (report.info === '') {
      setReport({ ...report, sending: true })
      let recipientsNumber = []
      let recipientsWithName = []
      contactIds.map((contactId) => {
        const contact = contacts.find(
          (_contact) => _contact.cellnumber === contactId,
        )
        if (contact) {
          recipientsNumber.push(contact.cellnumber)
          recipientsWithName.push(
            contact.name === '' ? contact.cellnumber : contact.name,
          )
        } else {
          recipientsNumber.push(contactId)
        }
      })

      try {
        await sendSMS({
          docId: report.id,
          recipientsNumber: recipientsNumber.toString(),
          message: report.smsRecommendations,
          currentSmsLogs: report?.logs ? report.logs : [],
          recipientsWithName: recipientsWithName.toString(),
        })

        setReport((prev) => ({
          ...prev,
          sending: false,
          info: 'Crop Recommendation sent.',
        }))
      } catch (err) {
        router.push(
          {
            pathname: '/admin/sms/',
            query: { isSent: false },
          },
          '/admin/sms/',
        )
        console.error(err.message)
      }
    } else {
      router.push({
        pathname: '/admin/sms/',
      })
    }
  }

  const handleAddContactsToPhonebook = () => {
    router.push(
      {
        pathname: '/admin/sms/',
        query: { toAddContact: true },
      },
      '/admin/sms/',
    )
  }

  return (
    <div>
      {loading || report.loading ? (
        <LoadingDocument />
      ) : report.stages !== undefined ? (
        <Box container sx={styles.container}>
          <Box
            sx={{
              marginBottom: '32px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <ThemeProvider theme={theme}>
              <Box>
                <Typography variant="h5">
                  Send Text-Form Crop Recommendation
                </Typography>
                <Typography variant="h6">
                  {REPORT_TITLE[report.type]}
                </Typography>
              </Box>
            </ThemeProvider>

            <ButtonGroup
              orientation={
                isScreenSizeBetweenXSandMD ? 'vertical' : 'horizontal'
              }
            >
              <Button
                disableElevation
                variant="outlined"
                color="primary"
                sx={{
                  ...styles.button,
                  color: (theme) => theme.palette.primary.main,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
                onClick={onBackBtnClick}
              >
                Back
              </Button>
              <ModalDialogWrapper
                isDisabled={
                  contactIds.length === 0 ||
                  report?.smsRecommendations === undefined
                }
                isOpen={false}
                maxWidth="sm"
                openButtonText="Send"
                title="Send Crop Recommendation"
                contentText={
                  report.info !== ''
                    ? report.info
                    : 'Sending this allows your contacts to receive the Text-Form Crop Recommendation on their cellphone numbers as text.'
                }
                confirmBtnText={report.info !== '' ? 'Ok' : 'Send'}
                modalConfirmHandlerCB={handleSend}
                loading={report.sending}
                modalButtonStyles={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  width: '80px',
                }}
              />
            </ButtonGroup>
          </Box>
          <div>
            <Box sx={stylesReport.details}>
              {fieldValues.map((item) => (
                <div key={item.id}>
                  <Typography variant="body2">
                    <strong>{item?.label}: </strong> {item?.value ?? '-'}
                  </Typography>
                </div>
              ))}
              <Typography variant="caption">
                <strong>ID:</strong> {report.id}
              </Typography>
            </Box>
            <Divider sx={{ marginTop: '32px' }} />
          </div>

          <Grid container style={{ paddingTop: '10px' }}>
            <Grid item xs={12} md={5}>
              <Typography variant="h6">
                Text-Form Crop Recommendation
              </Typography>
              <Container>
                {report?.smsRecommendations || (
                  <span style={{ color: '#ff1744' }}>
                    No SMS Recommendations available.
                  </span>
                )}
              </Container>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="h6">List of Contacts</Typography>
              {contactsState.loading ? (
                <div>Loading phonebook...</div>
              ) : contactsState.error !== '' ? (
                <div>{contactsState.error}</div>
              ) : contacts.length > 0 ? (
                <div>
                  <Box>
                    <Typography variant="body2">
                      These are your contacts that you can send the
                      recommendation thru SMS.
                      <br />
                      Need to change some of your contacts? Click{' '}
                      <span
                        onClick={handleAddContactsToPhonebook}
                        style={styles.customizedButtonLink}
                      >
                        here
                      </span>
                      .
                    </Typography>
                  </Box>

                  <br />

                  <div>
                    {groupedContacts &&
                      Object.keys(groupedContacts)
                        .sort()
                        .map((province, index) => {
                          return (
                            <Accordion key={index}>
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                              >
                                {province}
                              </AccordionSummary>
                              <AccordionDetails>
                                {Object.keys(groupedContacts[province])
                                  .sort()
                                  .map((municipality) => {
                                    return (
                                      <FormControl key={municipality}>
                                        <RadioGroup
                                          aria-labelledby="demo-radio-buttons-group-label"
                                          defaultValue="female"
                                          name="radio-buttons-group"
                                          value={selectedMunicipality} // Bind the selected value to RadioGroup
                                          onChange={(e) =>
                                            setSelectedMunicipality(
                                              e.target.value,
                                            )
                                          }
                                        >
                                          <FormControlLabel
                                            onClick={(e) =>
                                              handleSelectProvince(
                                                e,
                                                province,
                                                municipality,
                                              )
                                            }
                                            control={<Radio />}
                                            label={municipality}
                                            value={municipality}
                                          />
                                        </RadioGroup>
                                      </FormControl>
                                    )
                                  })}
                              </AccordionDetails>
                            </Accordion>
                          )
                        })}
                  </div>
                </div>
              ) : (
                <div>
                  <Typography variant="subtitle1">
                    No contacts yet. Please add contacts first in your
                    Phonebook&nbsp;
                    <span
                      onClick={handleAddContactsToPhonebook}
                      style={styles.customizedButtonLink}
                    >
                      here
                    </span>
                    .
                  </Typography>
                </div>
              )}
            </Grid>
          </Grid>
        </Box>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

export default ViewSendSMS
