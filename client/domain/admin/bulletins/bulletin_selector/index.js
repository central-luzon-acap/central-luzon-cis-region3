import Link from 'next/link'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import ImageGrid from './image_grid'
import ModalDialogWrapper from '@/common/ui/modal'

import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone'
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone'
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert'

function BulletinSelector () {
  return (
    <div>
      <ModalDialogWrapper
        maxWidth='sm'
        openButtonText='Generate Bulletin'
        title='Select a Crop Bulletin Type'
        showButtons={false}
        colorTheme='secondary'
      >
        <Grid container>
          <ImageGrid item xs={12} sm={4}>
            <Link href='/admin/bulletins/crops/seasonal/create' passHref>
              <a>
                <AssignmentTwoToneIcon sx={{ fontSize: '90px' }} />
                <Typography variant='subtitle1'>
                  Seasonal Climate
                </Typography>
                <Typography variant='subtitle1'>
                  Outlook and Advisory
                </Typography>
              </a>
            </Link>
          </ImageGrid>
          <ImageGrid item xs={12} sm={4}>
            <Link href='/admin/bulletins/crops/tenday/create' passHref>
              <a>
                <DescriptionTwoToneIcon sx={{ fontSize: '90px' }} />
                <Typography variant='subtitle1'>
                  10-Day Farm Weather Outlook
                </Typography>
                <Typography variant='subtitle1'>
                  and Advisory
                </Typography>
              </a>
            </Link>
          </ImageGrid>
          <ImageGrid item xs={12} sm={4}>
            <Link href='/admin/bulletins/crops/special/create' passHref>
              <a>
                <CrisisAlertIcon sx={{ fontSize: '90px' }} />
                <Typography variant='subtitle1'>
                  Special Weather Advisory
                </Typography>
              </a>
            </Link>
          </ImageGrid>
        </Grid>
      </ModalDialogWrapper>
    </div>
  )
}

export default BulletinSelector
