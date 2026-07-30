import Image from 'next/image'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { imageLoader, assetPrefixer } from '@/utils/img-loader'
import styles from './styles'

function EmptyState ({ message = 'Failed to load data', style={} }) {
  return (
    <Box sx={styles.container} style={style}>
      <Image
        unoptimized
        src={assetPrefixer('images/icons/empty-state-light.svg')}
        height={120}
        width={120}
        loader={imageLoader}
        alt='Empty data' />
      <Typography variant='subtitle1'>
        {message}
      </Typography>
    </Box>
  )
}

export default EmptyState
