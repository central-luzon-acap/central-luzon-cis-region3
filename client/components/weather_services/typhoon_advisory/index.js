import Image from 'next/image'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import HighlightedText from '@/domain/weather_services/highlightedtext'
import CaptionText from '@/common/ui/captiontext'
import PaperBgSoft from '@/common/ui/paperbgsoft'
import LoadingCyclone from '@/domain/weather_services/loadingcyclone'
import EmptyState from '@/common/ui/empty_state'
import { assetPrefixer, imageLoader } from '@/utils/img-loader'
import { getFirestoreDateTimeString } from '@/utils/date'
import InfoIcon from '@mui/icons-material/Info'
import styles from './styles'
import { REGION_NAME } from '@/utils/constants'

function TyphoonAdvisory ({
  cyclone,
  cycloneLoading,
  windspeedContent
}) {
  return (
    <Box sx={styles.wrapper} id='contents-special-weather-forecast'>
      <Typography variant='h4'>Special Weather Forecast</Typography>

      {cycloneLoading
        ? <LoadingCyclone />
        : (!cyclone)
          ? <EmptyState />
          : <div>
              {/** Temporary notification */}
              <Grid container sx={styles.dataContainer} spacing={2}>
                <Grid item xs={12} md={6}>
                  {/** References Section */}
                  <PaperBgSoft sx={styles.summary}>
                    <Box sx={{  padding: '16px' }}>
                      <Typography variant='h6'>Summary</Typography>
                      <CaptionText sx={{ color: (cyclone.has_cyclone) ? 'red' : 'rgba(0, 0, 0, 0.6)' }}>
                        {cyclone.summary}
                      </CaptionText>

                      <CaptionText sx={{ marginTop: '16px' }}>
                        This section is captured from PAGASA&apos;s <a href="https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin" target='_blank' rel="noreferrer">Tropical Cyclone Bulletin</a><br /> web page by
                        {cyclone.updated_by === 'system' ? ' system ' : ' an admin '}
                        on {getFirestoreDateTimeString(cyclone.date_updated)}. Please view PAGASA&apos;s Tropical Cyclone Bulletin web page to view the latest tropical cyclone information.
                      </CaptionText>
                    </Box>
                  </PaperBgSoft>
                </Grid>

                {!cyclone.has_cyclone &&
                  <Grid item xs={12} md={6}>
                    <PaperBgSoft sx={styles.summary} style={{ display: 'grid', placeContent: 'center' }}>
                      <Box sx={{  padding: '16px', textAlign: 'center' }}>
                        <InfoIcon color='primary' fontSize='large' />
                        <Typography variant='h6'>
                          No Active Tropical Cyclone
                        </Typography>
                      </Box>
                    </PaperBgSoft>
                  </Grid>
                }
              </Grid>

              {cyclone.has_cyclone &&
              <Grid container sx={styles.dataContainer} spacing={2}>
                {/** Left Column Content */}
                <Grid item xs={12} md={6}>
                  <PaperBgSoft sx={{ margin: 0, padding:0 }}>
                    <Box sx={{ textAlign: 'center', padding: '16px' }}>
                      <Typography variant='h6'>
                        {cyclone.data.meta.bulletin_number === 0 ? 'No Active Tropical Cyclone' : cyclone.data.meta.bulletin_number}
                      </Typography>
                      <Typography variant='subtitle1'>
                        {cyclone.data.meta.issued_at.toLowerCase().includes('issued at')
                          ? cyclone.data.meta.issued_at
                          : `Issued at ${cyclone.data.meta.issued_at}`
                        }
                      </Typography>
                    </Box>
                    <HighlightedText>
                      {cyclone.data.meta.typhoon_name}
                    </HighlightedText>

                    <Box sx={styles.dataContent}>
                      {cyclone.data.details.map((item, index) => (
                        <div key={index} style={{ padding: 0 }}>
                        <Box>
                          <Typography variant='subtitle2'>
                            <strong>{item.title}</strong>
                          </Typography>
                        </Box>
                        <Box className='data-content-description'>
                            {(typeof item.value === 'object')
                              ? <ul>
                                {item.value.map((str, idx) => (
                                  <li key={idx}>
                                    <Typography variant='body2'>{str}</Typography>
                                  </li>
                                ))}
                                </ul>
                              : <Typography variant='body2'>{item.value}</Typography>
                            }
                          </Box>
                        </div>
                      ))}
                    </Box>
                  </PaperBgSoft>
                </Grid>

                {/** Right Column Content */}
                <Grid item xs={12} md={6}>
                  <PaperBgSoft sx={{ margin: 0, padding: 0 }}>
                    {/** Typhoon Graphic */}
                    <Box sx={{ textAlign: 'center' }}>
                      {(cyclone.img === '')
                        ? <Image
                            unoptimized
                            src={assetPrefixer('images/placeholders/pixel-gray.png')}
                            height={450}
                            width={540}
                            loader={imageLoader}
                            alt='placeholder' />
                        : <Image
                            unoptimized
                            src={cyclone.img}
                            height={450}
                            width={540}
                            loader={imageLoader}
                            alt='placeholder' />
                      }
                    </Box>

                    {/** Tropical Cyclone Wind Signal Section */}
                    <HighlightedText>
                      Tropical Cyclone Wind Signal
                    </HighlightedText>

                    {Object.keys(windspeedContent.data).length === 0
                      ? <Box sx={styles.dataContentDescriptionText}>
                          <CaptionText>
                            {windspeedContent.updated_by !== 'system'
                              && <span>The {REGION_NAME} region is clear of tropical cyclone wind signal.<br /></span>
                            }

                            (Wind signal information {windspeedContent.caption} {getFirestoreDateTimeString(windspeedContent.date_created)})
                          </CaptionText>
                        </Box>
                      : <Box>
                          {/** Wind signal reference */}
                          <Box sx={styles.dataContentDescriptionText}>
                            <CaptionText>
                              Wind signal information {windspeedContent.caption} {getFirestoreDateTimeString(windspeedContent.date_created)}
                            </CaptionText>
                          </Box>

                          {Object.keys(windspeedContent.data).map((signal, index) => (
                            <Box sx={styles.dataContentDescriptionText} key={`cyclone-signal-${index}`}>
                              <div key={index}>
                                {index > 0 && <Divider className='windsignalcontent'/>}

                                {/** Signal Number Header */}
                                <Typography variant='body1'>
                                  <strong>Signal #{signal}: &nbsp; </strong>
                                </Typography>

                                {/** Signal no. affected provinces */}
                                {windspeedContent.data[signal].map((group, index) => (
                                  <Typography variant='body2' key={index} sx={{ marginTop: '8px' }}>
                                    <strong>{group.province}</strong> {group.municipalities}
                                  </Typography>
                                ))}
                              </div>
                            </Box>
                          ))}
                        </Box>
                    }
                  </PaperBgSoft>
                </Grid>
              </Grid>
              }
            </div>
      }
    </Box>
  )
}

export default TyphoonAdvisory
