import { useEffect, useState } from 'react'
import { getProvincesMunicipalities } from '@/services/region'
import AgroclimaticServices from '@/components/agroclimatic_services'
import ShareHead from '@/common/layout/sharehead'
import { REGION_NAME } from '@/utils/constants'
import { getPageAssetsDoc } from '@/services/utilities'

const ASSET_KEY = 'og_recommendations'

// NextJS static props
export async function getStaticProps() {
  let media = {
    description: '',
    url: '',
    path: `${process.env.BASE_URL}/agroclimatic-services`,
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

function AgroclimaticServicesContainer({ media }) {
  const [provinces, setProvinces] = useState([])

  useEffect(() => {
    // TO-DO: Use hooks
    const loadProvinces = async () => {
      try {
        const provinces = await getProvincesMunicipalities()
        setProvinces(provinces.data)
      } catch (error) {
        // console.error(error.message)
      }
    }

    loadProvinces()
  }, [])

  return (
    <div>
      {process.env.BASE_URL === process.env.BASE_URL_PROD && (
        <ShareHead
          title={`Agro-Climatic Advisory Portal - ${REGION_NAME} (ACAP-${REGION_NAME.toUpperCase()}) Crop Recommendations`}
          ogDescription={media.description}
          ogImageURL={media.url}
          ogURL={media.path}
          canonicalURL={media.path}
        />
      )}

      <AgroclimaticServices provinces={provinces} />
    </div>
  )
}

export default AgroclimaticServicesContainer
