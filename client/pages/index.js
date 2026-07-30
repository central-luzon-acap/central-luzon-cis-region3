import { useSelector } from 'react-redux'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { getVillages, getProvincesMunicipalities } from '../src/services/region'
import DialogContentText from '@mui/material/DialogContentText'
import ShareHead from '@/common/layout/sharehead'
import { REGION_NAME, REGIONAL_FIELD_OFFICE } from '@/utils/constants'
import { getPageAssetsDoc } from '@/services/utilities'

const Header = dynamic(() => import('../components/common/layout/header'), {
  ssr: false,
})
const Map = dynamic(() => import('../components/map'), { ssr: false })
const WelcomeModal = dynamic(() => import('../components/home/welcomemodal'), {
  ssr: false,
})
const ASSET_KEY = 'og_home'

// NextJS static props
export async function getStaticProps() {
  let media = { description: '', url: '', path: process.env.BASE_URL }

  const { data: villageData } = await getVillages()
  const { data: provincesMunicipalitiesData } =
    await getProvincesMunicipalities()

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
      villages: villageData,
      provincesMunicipalities: provincesMunicipalitiesData,
      media,
    },
  }
}

function Home({ villages, provincesMunicipalities, media }) {
  const data = {
    villages,
    provincesMunicipalities,
  }
  const [display, setShouldDisplay] = useState(false)
  const showWelcome = useSelector((state) => state.dashboard.showWelcome)

  useEffect(() => {
    if (showWelcome) {
      setShouldDisplay(showWelcome)
    }
  }, [showWelcome])

  return (
    <>
      {process.env.BASE_URL === process.env.BASE_URL_PROD && (
        <ShareHead
          title={`Agro-Climatic Advisory Portal - ${REGION_NAME} (ACAP-${REGION_NAME.toUpperCase()})`}
          ogDescription={media.description}
          ogImageURL={media.url}
          ogURL={media.path}
          canonicalURL={media.path}
        />
      )}

      <Header />
      <Map data={data} />

      <WelcomeModal
        title={`Welcome to the Agro-Climatic Advisory Portal-${REGION_NAME} (ACAP-${REGION_NAME.toUpperCase()})!`}
        isOpen={display}>
          <DialogContentText variant='body1'>
            This website serves as a centralized hub for the development of
            Climate Information Services (CIS) in the {REGION_NAME} Region. It contains
            relevant weather and climate information which can be used in
            developing tailored advisories and crop recommendations.
          </DialogContentText>
          <DialogContentText variant='body1' sx={{ marginTop: '16px' }}>
            The ACAP-{REGION_NAME} is a work-in-progress and we welcome any feedbacks and
            suggestions. For any concerns regarding this website, you may send an
            e-mail at{' '}
            <span style={{ color: '#438364' }}>daamiarfo{REGIONAL_FIELD_OFFICE}@gmail.com</span>.
          </DialogContentText>
      </WelcomeModal>
    </>
  )
}

Home.customLayout = true
export default Home
