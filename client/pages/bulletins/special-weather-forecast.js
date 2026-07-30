import ShareHead from '@/common/layout/sharehead'
import { REGION_NAME } from '@/utils/constants'
import BulletinContainer from '@/domain/bulletins/bulletincontainer'
import { getProvinces } from '@/services/region'
import { getPageAssetsDoc } from '@/services/utilities'
import { DEFAULT_SELECTED_BULLETIN } from '@/utils/constants/bulletins'
import { REPORT_TYPE } from '@/utils/constants/app'
import { PDF_BULLETINS } from '@/utils/constants/bulletins'

const ASSET_KEY = 'og_bulletins_typhoon'
const urlsegment = {
  keyword: 'bulletins_special%2F',
  charlength: 20
}
const currentDefaultBulletin = {
  ...DEFAULT_SELECTED_BULLETIN,
  collection: PDF_BULLETINS.PDF_CROPS_SPECIAL,
  type: REPORT_TYPE.SPECIAL_WEATHER,
  urlsegment
}

// NextJS static props
export async function getStaticProps () {
  let media = { description: '', url: '', path: `${process.env.BASE_URL}/bulletins/special-weather-forecast` }

  const provinces = await getProvinces()

  if (process.env.BASE_URL === process.env.BASE_URL_PROD) {
    const data = await getPageAssetsDoc('opengraph', 'og', true)
    const item = data.find(item => item.filename === ASSET_KEY)

    if (item) {
      media.description = item.description
      media.url = item.url
    }
  }

  return {
    props: {
      media,
      provincelist: provinces.map(province => province.name)
    }
  }
}

function TyphoonAdvisory ({ provincelist, media }) {
  return (
    <div id='acap-bulletins-special'>
      {(process.env.BASE_URL === process.env.BASE_URL_PROD) &&
        <ShareHead
          title={`Agro-Climatic Advisory Portal - ${REGION_NAME} (ACAP-${REGION_NAME.toUpperCase()}) Special Weather Forecast Bulletins`}
          ogDescription={media.description}
          ogImageURL={media.url}
          ogURL={media.path}
          canonicalURL={media.path}
        />
      }

      <BulletinContainer
        provinces={provincelist}
        subtitle='Special Weather'
        currentDefaultBulletin={currentDefaultBulletin}
      />
    </div>
  )
}

export default TyphoonAdvisory
