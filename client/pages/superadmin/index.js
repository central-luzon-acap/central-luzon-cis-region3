import { ACCOUNT_LEVEL } from '@/utils/constants'
import withAuthListener from '@/common/entities/withauth'
import ProtectedPage from '@/common/layout/protectedpage'
import SuperAdmin from '@/components/superadmin'

function SuperadminContainer (props) {
  return (
    <ProtectedPage
      loading={props.loading}
      user={props.user}
      onBtnLogoutClick={props.onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.SUPERADMIN}
    >
      <SuperAdmin />
    </ProtectedPage>
  )
}

export default withAuthListener(SuperadminContainer)
