import { REGION_NAME, REGIONAL_FIELD_OFFICE, REGION_URL } from '@/utils/constants'

const urls = {
  'partners': [
    {
      'label': 'Department of Agriculture (DA)',
      'url': 'https://www.da.gov.ph/'
    },
    {
      'label': `Department of Agriculture - ${REGION_NAME} Region (DA RFO ${REGIONAL_FIELD_OFFICE})`,
      'url': REGION_URL
    },
    {
      'label': 'University of the Philippines Los Baños Foundation Incorporated (UPLBFI)',
      'url': 'https://uplbfi.org/'
    },
    {
      'label': 'Alliance Bioversity & CIAT',
      'url': 'https://alliancebioversityciat.org/'
    },
    {
      'label': 'AMIA CIAT Demo',
      'url': 'https://ciatph.github.io/'
    },

    {
      'label': 'Privacy Policy',
      'url' :  '/privacy-policy'
    }
  ],
  'quicklinks': [
    {
      'label': 'Home',
      'url': '/'
    },
    {
      'label': 'ACAP Services',
      'url': '/weather-services'
    },
    {
      'label': 'Cropping Calendar V2',
      'url': '/cropping-calendar-v2'
    },
    {
      'label': 'Bulletins',
      'url': '/bulletins'
    },
    {
      'label': 'Admin',
      'url': '/admin'
    }
  ]
}

export default urls
