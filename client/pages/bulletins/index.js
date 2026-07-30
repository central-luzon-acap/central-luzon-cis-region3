import Bulletins from '@/components/bulletins'
import Typography from '@mui/material/Typography'
import ShareHead from '@/common/layout/sharehead'
import { REGION_NAME } from '@/utils/constants'
import { getPageAssetsDoc } from '@/services/utilities'

const ASSET_KEY = 'og_bulletins'

// NextJS static props
export async function getStaticProps() {
  let info = {
    description: '',
    url: '',
    path: `${process.env.BASE_URL}/bulletins`,
  }
  const assets = await getPageAssetsDoc('opengraph', null, true)

  const media =
    assets?.data
      ?.filter((item) => item.page === 'bulletins')
      .map((item) => item.url) || []

  if (process.env.BASE_URL === process.env.BASE_URL_PROD) {
    const item = assets?.data?.find(
      (item) => item.page === 'og' && item.filename === ASSET_KEY,
    ) || {
      description: '-',
      url: '-',
    }

    if (item) {
      info.description = item.description
      info.url = item.url
    }
  }

  return {
    props: {
      media,
      info,
    },
  }
}

function BulletinsContainer({ media, info }) {
  return (
    <div id="acap-bulletins">
      {process.env.BASE_URL === process.env.BASE_URL_PROD && (
        <ShareHead
          title={`Agro-Climatic Advisory Portal - ${REGION_NAME} (ACAP-${REGION_NAME.toUpperCase()}) Bulletins`}
          ogDescription={info.description}
          ogImageURL={info.url}
          ogURL={info.path}
          canonicalURL={info.path}
        />
      )}

      <Typography variant="h4">Bulletins</Typography>
      <Typography variant="label">
        Welcome s to the Bulletins PDF downloads page. You can preview and
        download Bulletins integrated with the Seasonal and 10-Day Weather
        Forecasts here.
      </Typography>

      <Bulletins media={media} />
    </div>
  )
}

export default BulletinsContainer
