import Image from 'next/image'
import { imageLoader } from '@/utils/img-loader'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import EmptyState from '@/common/ui/empty_state'
import CaptionText from '@/common/ui/captiontext'
import { getFirestoreDateTimeString } from '@/utils/date'
import styles from './styles'

function ClimatePattern ({ typhoon = null, loading }) {
  return (
    <Box sx={styles.wrapper}>
      {loading
        ? // Skeleton loader
        <Grid container maxWidth='lg' sx={styles.container} spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton animation='wave' variant='rectangular' height={200} sx={{ minWidth: '200px' }} />
          </Grid>
          <Grid item xs={12} md={6}>
            {[1,2,3,4,5].map((index) => (
              <Skeleton key={`pattern-${index}`} animation='wave' style={{ marginBottom: 6 }} />
            ))}
            <Skeleton animation='wave' width='80%' />
          </Grid>
          <Grid item xs={12} md={3} />
        </Grid>
        : (typhoon !== null)
          ? // Content
          <Grid container maxWidth='lg' sx={styles.container} spacing={4}>
            <Grid item xs={12} md={6}>
              <Image
                unoptimized
                src={typhoon.img}
                height={273}
                width={600}
                loader={imageLoader}
                alt='El Niño / La Niña Monitoring' />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='h5'>El Niño / La Niña Monitoring</Typography>

              <p>{typhoon.description}</p>

              <CaptionText>
                 Captured from PAGASA&apos;s <a href='https://www.pagasa.dost.gov.ph/climate/el-nino-la-nina/monitoring' target='_blank' rel="noreferrer">El Niño / La Niña Monitoring</a> web page
                <br />
                by {typhoon.updated_by} on &nbsp;
                {getFirestoreDateTimeString(typhoon.date_updated)}

                <br />
                <i><strong>Note:</strong> The information displayed above is only every Sunday.</i>
              </CaptionText>
            </Grid>
          </Grid>
          : <EmptyState />
      }
    </Box>
  )
}

export default ClimatePattern
