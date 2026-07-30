import ShareHead from '@/common/layout/sharehead'
import { REGION_NAME } from '@/utils/constants'
import BulletinContainer from '@/domain/bulletins/bulletincontainer'
import { getProvinces } from '@/services/region'
import { getPageAssetsDoc } from '@/services/utilities'
import { DEFAULT_SELECTED_BULLETIN } from '@/utils/constants/bulletins'
import { REPORT_TYPE } from '@/utils/constants/app'
import { PDF_BULLETINS } from '@/utils/constants/bulletins'

const ASSET_KEY = 'og_bulletins_10day'
const urlsegment = {
  keyword: 'bulletins_tenday%2F',
  charlength: 19
}
const currentDefaultBulletin = {
  ...DEFAULT_SELECTED_BULLETIN,
  collection: PDF_BULLETINS.PDF_CROPS_TENDAY,
  type: REPORT_TYPE.TEN_DAY,
  urlsegment
}

// NextJS static props
export async function getStaticProps () {
  let media = { description: '', url: '', path: `${process.env.BASE_URL}/bulletins/weather` }

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

function WeatherBulletinContainer ({ provincelist, media }) {
  return (
    <div id='acap-bulletins-10day'>
      {(process.env.BASE_URL === process.env.BASE_URL_PROD) &&
        <ShareHead
          title={`Agro-Climatic Advisory Portal - ${REGION_NAME} (ACAP-${REGION_NAME.toUpperCase()}) 10-Day Farm Weather Outlook Bulletins`}
          ogDescription={media.description}
          ogImageURL={media.url}
          ogURL={media.path}
          canonicalURL={media.path}
        />
      }

      <BulletinContainer
        provinces={provincelist}
        subtitle='10-Day Farm Weather Outlook'
        currentDefaultBulletin={currentDefaultBulletin}
      />
    </div>
  )
}

export default WeatherBulletinContainer
