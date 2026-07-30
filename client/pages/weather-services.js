import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProvinces } from '@/store/provinces/provinceThunks'

import Typography from '@mui/material/Typography'
import TenDayForecast from '@/components/weather_services/ten_day_forecast'
import SeasonalForecast from '@/components/weather_services/seasonal_forecast'
import TyphoonAdvisory from '@/components/weather_services/typhoon_advisory'
import SupportServices from '@/components/weather_services/support_services'
import ShareHead from '@/common/layout/sharehead'
import { REGION_NAME } from '@/utils/constants'
import { _Utilities } from '@/services/utilities/utilities'
import { _WeatherForecastGetter } from '@/services/weatherforecast_getter/weatherforecast_getter'
import { useNestedCollection, useDocument } from '@/hooks/usefirestore'
import { getPageAssetsDoc } from '@/services/utilities'

const ASSET_KEY = 'og_services'

const defaultWindSpeed = {
  data: {},
  date_created: '',
  caption: '',
  udpdated_by: '',
}

// NextJS static props
export async function getStaticProps() {
  let media = {
    description: '',
    url: '',
    path: `${process.env.BASE_URL}/weather-services`,
  }

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
      media,
    },
  }
}

function WeatherServices({ media }) {
  const [typhoon, loading] = useDocument(
    _Utilities.GLOBAL_COLLECTIONS,
    _Utilities.TYPHOON_ADVISORY,
  )
  const [cyclone, cycloneLoading] = useDocument(
    _Utilities.GLOBAL_COLLECTIONS,
    _Utilities.CYCLONE_ADVISORY,
  )
  const [windspeed, wLoading] = useDocument(
    _WeatherForecastGetter.WEATHER_FORECASTS,
    `${process.env.REGION_NAME}/${_WeatherForecastGetter.SUB_SPECIAL_COMMON}/${_WeatherForecastGetter.COMMON_SPECIAL_TYPE.WIND_SPEED}`,
  )
  const { documents: forecastSeasonal, loading: fsLoading } =
    useNestedCollection(
      _WeatherForecastGetter.WEATHER_FORECASTS,
      process.env.REGION_NAME,
      _WeatherForecastGetter.SUB_SEASONAL,
      'name',
    )
  const [windspeedContent, setWindspeedContent] = useState(defaultWindSpeed)
  const ids = useSelector((state) => state.provinces.ids)
  const mounted = useRef(null)
  const dispatch = useDispatch()

  useEffect(() => {
    if (mounted.current === null && ids.length === 0) {
      mounted.current = true
      dispatch(fetchProvinces())
    }
  }, [dispatch, ids.length])

  useEffect(() => {
    if (!wLoading && windspeed !== null) {
      const caption =
        windspeed.updated_by === 'system'
          ? 'was reset by system on '
          : 'was updated by an admin on '

      // Format the wind speed content
      setWindspeedContent({
        caption,
        updated_by: windspeed.updated_by,
        date_created: windspeed.date_created,
        data: windspeed.data.reduce((list, item) => {
          if (list[item.signal] === undefined) {
            list[item.signal] = []
          }

          const str = {
            province: item.province,
            municipalities: `(${item.municipalities
              .toString()
              .split(',')
              .join(', ')})`,
          }

          list[item.signal].push(str)
          return list
        }, {}),
      })
    }
  }, [windspeed, wLoading])

  return (
    <div id="ten-day-weather-forecast">
      {process.env.BASE_URL === process.env.BASE_URL_PROD && (
        <ShareHead
          title={`Agro-Climatic Advisory Portal - ${REGION_NAME} (ACAP-${REGION_NAME.toUpperCase()}) ACAP Services`}
          ogDescription={media.description}
          ogImageURL={media.url}
          ogURL={media.path}
          canonicalURL={media.path}
        />
      )}

      <Typography variant="h4">ACAP Services</Typography>
      <Typography variant="label">
        Weather Forecasts and Special Weather Advisory information
      </Typography>

      <TenDayForecast />

      <div id="seasonal-forecast" style={{ height: '64px' }}></div>

      <SeasonalForecast
        seasonal={forecastSeasonal}
        typhoon={typhoon}
        fsLoading={fsLoading}
        loading={loading}
      />

      <div id="special-weather-forecast" style={{ height: '40px' }}></div>

      <TyphoonAdvisory
        cyclone={cyclone}
        cycloneLoading={cycloneLoading}
        windspeedContent={windspeedContent}
      />

      <div id="support-services" style={{ height: '40px' }}></div>
      <SupportServices />
    </div>
  )
}

export default WeatherServices
