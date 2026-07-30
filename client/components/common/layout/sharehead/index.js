import Head from 'next/head'
import { REGION_NAME } from '@/utils/constants'

function ShareHead ({
  title,
  ogDescription,
  ogImageURL,
  ogImgAlt = 'Picture',
  ogSiteName = `ACAP-${REGION_NAME.toUpperCase()}`,
  ogURL,
  canonicalURL = 'http://localhost'
}) {
  return (
    <Head>
      <meta name="description" content={ogDescription} />
      <meta rel="canonical" href={canonicalURL} />
      <meta name="og:description" content={ogDescription} />
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content={ogSiteName} />
      <meta property="og:image" content={ogImageURL} />
      <meta property="og:image:width" content="600" />
      <meta property="og:image:height" content="315" />
      <meta property="og:image:alt" content={ogImgAlt} />
      <meta property="og:url" content={ogURL} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:image" content={ogImageURL} />
      <title>{title}</title>
    </Head>
  )
}

export default ShareHead
