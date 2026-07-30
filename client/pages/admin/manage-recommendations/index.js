import withAuthListener from '@/common/entities/withauth'
import ProtectedPage from '@/common/layout/protectedpage'
import ManageRecommendations from '@/components/admin/manage-recommendations'
import { ACCOUNT_LEVEL } from '@/utils/constants'

function ManageRecommendationsContainer ({ loading, user, onBtnLogoutClick }) {
  return (
    <ProtectedPage
      loading={loading}
      user={user}
      onBtnLogoutClick={onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <ManageRecommendations />
    </ProtectedPage>
  )
}

export default withAuthListener(ManageRecommendationsContainer)
