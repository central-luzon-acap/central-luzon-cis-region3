import {
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@/common/ui/accordion/accordion_components'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import ReusableBreadcrumbs from '@/common/ui/breadcrumbs'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import styles from '../pdflist/styles'

function PdfPlaceholders ({ provinces }) {
  return (
    <div role='presentation'>
      <Typography variant='h4'>Bulletins</Typography>
      <Typography variant='h5'>Special Weather</Typography>

      <ReusableBreadcrumbs navdata={[
        { name: 'Bulletins', href: '/bulletins' },
        { name: 'Special Weather' }
      ]} />

      <Grid container justifyContent='center' sx={{ width: '100%', marginTop: (theme) => theme.spacing(6) }}>
        <Grid item xs={10}>
          {provinces.map((item, index) => (
            <Accordion sx={{ maxWidth: '720px'}} key={`acc-${index}`} defaultExpanded={index===0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1-content'>
                <Typography variant='subtitle1'>{item}</Typography>
              </AccordionSummary>

              <AccordionDetails>
                {[1,2,3,4,5,6,7,8].map((itm, idx) => (
                  <List dense={true} sx={{ padding: 0 }} key={`acc-sub-${idx}`}>
                    <ListItem>
                      <ListItemIcon><PictureAsPdfIcon /></ListItemIcon>
                      <ListItemText
                        sx={styles.listItem}
                        primary={<a href='#'>{`generic_unique_${idx}_${item.toLowerCase()}.pdf`}</a>}
                        secondary='Created on 2022-05-26'
                        primaryTypographyProps={{ fontSize: '14px' }}
                        secondaryTypographyProps={{ fontSize: '11px' }}
                      />
                    </ListItem>
                  </List>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
      </Grid>
    </div>
  )
}

export default PdfPlaceholders
