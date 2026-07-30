import { ACCOUNT_LEVEL } from '@/utils/constants'
import CommonLoginContainer from '@/common/entities/login'
import ShareHead from '@/common/layout/sharehead'
import { REGION_NAME } from '@/utils/constants'
import { getPageAssetsDoc } from '@/services/utilities'

const ASSET_KEY = 'og_admin'

// NextJS static props
export async function getStaticProps () {
  let media = { description: '', url: '', path: `${process.env.BASE_URL}/admin/login` }

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
      media
    }
  }
}

function LoginContainer ({ media }) {
  return (
    <>
      {(process.env.BASE_URL === process.env.BASE_URL_PROD) &&
        <ShareHead
          title={`Agro-Climatic Advisory Portal - ${REGION_NAME} (ACAP-${REGION_NAME.toUpperCase()}) Admin Login`}
          ogDescription={media.description}
          ogImageURL={media.url}
          ogURL={media.path}
          canonicalURL={media.path}
        />
      }

      <CommonLoginContainer
        loginTitle='Admin'
        accLevel={ACCOUNT_LEVEL.ADMIN}
      />
    </>
  )
}

export default LoginContainer
