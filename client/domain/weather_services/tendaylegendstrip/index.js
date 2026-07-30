import Image from 'next/image'
import { imageLoader, assetPrefixer } from '@/utils/img-loader'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import PaperBg from '@/common/ui/paperbg'
import styles from './styles'

function TendayLegendStrip ({
  sideTitle = '',
  legendsData
}) {
  return (
    <Grid container gap={0} sx={{ width: '100%', marginTop: '16px' }}>
      <Grid item sx={styles.titleContainer} xs={12} lg={2}>
        <Typography variant='subtitle2'>
          {sideTitle}
        </Typography>
      </Grid>
      <Grid xs={12} item lg={10} sx={styles.cardsContainer}>
        {legendsData.map((item, index) => (
          <PaperBg
            key={index}
            sx={styles.iconCard}
            style={{
              visibility: (item.hidden)
                ? 'hidden'
                : 'visible'
          }}>
            <Box sx={styles.imgContainer}>
              <Image
                unoptimized
                src={assetPrefixer(`images/icons/weather/${item.icon}`)}
                height={45}
                width={45}
                loader={imageLoader}
                alt={item.label}
              />
              </Box>
              <span style={{ whiteSpace: (item.nowrap) ? 'nowrap' : 'normal' }}>
                {item.label}
              </span>
          </PaperBg>
        ))}
      </Grid>
    </Grid>
  )
}

export default TendayLegendStrip
