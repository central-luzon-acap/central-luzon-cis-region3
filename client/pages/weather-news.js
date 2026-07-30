import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ShareHead from '@/common/layout/sharehead'
import Link from 'next/link'
import { REGION_NAME } from '@/utils/constants'
import { getPageAssetsDoc } from '@/services/utilities'

const ASSET_KEY = 'og_weather_news'

export async function getStaticProps() {
  let media = {
    description: '',
    url: '',
    path: `${process.env.BASE_URL}/weather-news`,
  }

  if (process.env.BASE_URL === process.env.BASE_URL_PROD) {
    const data = await getPageAssetsDoc('opengraph', 'og', true)
    const item = data.find((item) => item.filename === ASSET_KEY)

    if (item) {
      media.description = item.description
      media.url = item.url
    }
  }

  return {
    props: {
      media,
    },
  }
}

function WeatherNews({ media }) {
  return (
    <div id="weather-news-update">
      {process.env.BASE_URL === process.env.BASE_URL_PROD && (
        <ShareHead
          title={`Agro-Climatic Advisory Portal - ${REGION_NAME} (ACAP-${REGION_NAME.toUpperCase()}) Weather News Update`}
          ogDescription={media.description}
          ogImageURL={media.url}
          ogURL={media.path}
          canonicalURL={media.path}
        />
      )}

      <Typography variant="h4" gutterBottom>
        Weather News Update
      </Typography>
      <Typography variant="label" display="block" gutterBottom>
        Check the latest weather announcements, advisories, and updates for the
        region. This page is intended for weather news and announcement content.
      </Typography>

      <Box sx={{ marginTop: 3, maxWidth: '720px' }}>
        <Typography variant="h6" gutterBottom>
          Latest Weather News
        </Typography>
        <Typography variant="body1" paragraph>
          This page can be used to share important weather news and advisories
          for local stakeholders. Once an update is ready, publish it here so it
          appears on the homepage and in the weather news section.
        </Typography>
        <Typography variant="body2" paragraph>
          For administrators, use the Reports and Bulletins section in the admin
          portal to publish formal weather news and bulletin updates.
        </Typography>
        <Link href="/bulletins" passHref>
          <Button component="a" variant="contained">View Bulletins</Button>
        </Link>
      </Box>
    </div>
  )
}

export default WeatherNews
