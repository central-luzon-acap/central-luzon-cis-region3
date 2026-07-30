import PropTypes from 'prop-types'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@/common/ui/accordion/accordion_components'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ReusableBreadcrumbs from '@/common/ui/breadcrumbs'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import styles from './styles'

function PDFList ({ provinces, bulletins, isDeleting, isFetching, isPDFLoading, isUser, handleClick, onDeleteClick, subtitle = '' }) {
  // 20240612: "General" special weather bulletin for typhoons outside PAR
  // not connected to province/municipality and cropping calendar now have an "n/a" value where applicable
  const GENERAL_SPECIAL_LABEL = 'General Special Recommendations'
  const GENERAL_SPECIAL_CODE = 'n/a'

  return (
    <div role='presentation'>
      <Typography variant='h4'>Bulletins</Typography>
      <Typography variant='h5'>{subtitle}</Typography>

      <ReusableBreadcrumbs navdata={[
        { name: 'Bulletins', href: '/bulletins' },
        { name: subtitle }
      ]} />

      <Grid container justifyContent='center' sx={{ width: '100%', marginTop: (theme) => theme.spacing(6) }}>
        <Grid item xs={10}>
          {provinces.map((item, index) => (
            <Accordion
              key={`acc-${index}`}
              defaultExpanded={index === 0}
              sx={{
                maxWidth: '720px',
                ...(item === GENERAL_SPECIAL_CODE && { marginTop: '32px' })
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1-content'>
                <Typography variant='subtitle1'>
                  {(item !== 'n/a')
                    ? item
                    : GENERAL_SPECIAL_LABEL
                  }
                </Typography>
              </AccordionSummary>

              {(bulletins[item] !== undefined) &&
              <AccordionDetails>
                {bulletins[item].map((itm, idx) => {
                  return <List dense={true} sx={{ padding: 0 }} key={`acc-sub-${idx}`}>
                    <ListItem>
                      <ListItemIcon><PictureAsPdfIcon /></ListItemIcon>

                      <ListItemText
                        sx={styles.listItem}
                        primary={
                          <a href='#'
                            disabled={isFetching || isDeleting || isPDFLoading}
                            onClick={(e) => {
                              e.preventDefault()
                              if (isFetching || isDeleting || isPDFLoading) {
                                return
                              }

                              handleClick(itm.province, itm.filename)
                            }}
                          >
                            {itm.filename}
                          </a>
                        }
                        secondary={`Created on ${itm.date_created} ${(itm.error !== '') ? `Error: ${itm.error}` : ''}`}
                        primaryTypographyProps={{ fontSize: '14px' }}
                        secondaryTypographyProps={{ fontSize: '11px' }}
                      />

                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress
                          size={20}
                          color='third'
                          sx={{
                            display: (itm.loading && (isFetching || isDeleting || isPDFLoading)) ? 'block' : 'none'
                          }}
                        />

                        {isUser &&
                          <IconButton
                            aria-label='delete'
                            color='primary'
                            disabled={isFetching || isDeleting || isPDFLoading}
                            onClick={() => onDeleteClick(itm)}
                          >
                            <DeleteForeverIcon />
                          </IconButton>
                        }
                      </div>
                    </ListItem>
                  </List>
                })}
              </AccordionDetails>}
            </Accordion>
          ))}
        </Grid>
      </Grid>
    </div>
  )
}

PDFList.propTypes = {
  provinces: PropTypes.array,
  bulletins: PropTypes.object,
  isDeleting: PropTypes.bool,
  isFetching: PropTypes.bool,
  isPDFLoading: PropTypes.bool,
  isUser: PropTypes.bool,
  handleClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  subtitle: PropTypes.string
}

export default PDFList
