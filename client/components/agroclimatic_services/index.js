import PaperBg from '@/common/ui/paperbg'
import SeasonalRecommendationsV2 from '@/domain/agroclimatic_services/seasonal_v2'
import TendayRecommendationsV2 from '@/domain/agroclimatic_services/tenday_v2'

function AgroclimaticServices({ provinces = [] }) {
  return (
    <div>
      <PaperBg sx={{ boxShadow: 'none' }}></PaperBg>
      <div id="seasonal-recommendations"></div>

      <PaperBg sx={{ marginTop: '80px', boxShadow: 'none' }}>
        <SeasonalRecommendationsV2 provinces={provinces} />
      </PaperBg>

      <div id="resilient-practices"></div>

      <PaperBg sx={{ marginTop: '80px', boxShadow: 'none' }}>
        <TendayRecommendationsV2 provinces={provinces} />
      </PaperBg>
    </div>
  )
}

export default AgroclimaticServices
