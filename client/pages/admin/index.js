import withAuthListener from '@/common/entities/withauth'
import ProtectedPage from '@/common/layout/protectedpage'
import Admin from '@/components/admin'
import { ACCOUNT_LEVEL } from '@/utils/constants'

function AdminContainer (props) {
  return (
    <ProtectedPage
      loading={props.loading}
      user={props.user}
      onBtnLogoutClick={props.onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <Admin />
    </ProtectedPage>
  )
}

export default withAuthListener(AdminContainer)
