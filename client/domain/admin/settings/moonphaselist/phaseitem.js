import Image from 'next/image'
import Box from '@mui/material/Box'
import { imageLoader, assetPrefixer } from '@/utils/img-loader'

function PhaseItem ({ text, label, imagePath }) {
  return (
    <Box sx={{
      borderRadius: '4px',
      margin: '4px',
      padding: '8.5px 14px 8.5px 8.5px',
      fontSize: '1rem',
      lineHeight: '1.4375em',
      '& span': {
        marginLeft: '8px'
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Image
          unoptimized
          src={assetPrefixer(imagePath)}
          height={20}
          width={20}
          loader={imageLoader}
          alt='moon phase' />
        <span>
          {label}:
        </span>
        <span>
          {text}
        </span>
      </Box>
    </Box>
  )
}

export default PhaseItem
