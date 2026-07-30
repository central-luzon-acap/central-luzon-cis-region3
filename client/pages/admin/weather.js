import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProvinces } from '@/store/provinces/provinceThunks'

import withAuthListener from '@/common/entities/withauth'
import ProtectedPage from '@/common/layout/protectedpage'
import AdminWeather from '@/components/admin/weather'
import { ACCOUNT_LEVEL } from '@/utils/constants'

function AdminWeatherContainer (props) {
  const dispatch = useDispatch()
  const ids = useSelector((state) => state.provinces.ids)

  useEffect(() => {
    if (ids.length === 0) {
      dispatch(fetchProvinces())
    }
  }, [dispatch, ids])

  return (
    <ProtectedPage
      loading={props.loading}
      user={props.user}
      onBtnLogoutClick={props.onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <AdminWeather />
    </ProtectedPage>
  )
}

export default withAuthListener(AdminWeatherContainer)
