import withAuthListener from '@/common/entities/withauth'
import ProtectedPage from '@/common/layout/protectedpage'
import CroppingCalendars from '@/components/admin/cropping-calendars'
import { ACCOUNT_LEVEL } from '@/utils/constants'

function CroppingCalendarsContainer ({ loading, user, onBtnLogoutClick }) {
  return (
    <ProtectedPage
      loading={loading}
      user={user}
      onBtnLogoutClick={onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <CroppingCalendars />
    </ProtectedPage>
  )
}

export default withAuthListener(CroppingCalendarsContainer)
