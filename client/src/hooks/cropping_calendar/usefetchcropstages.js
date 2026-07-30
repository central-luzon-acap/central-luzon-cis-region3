import { useEffect, useReducer } from 'react'

import { getCropStages } from '@/services/crop_calendar'
import useFetchCrops from './useFetchCrops'

const ACTIONS = {
  LOAD: 'load',
  FETCH_SUCCESS: 'fetch_success',
  FETCH_ERROR: 'fetch_error',
  SET: 'set',
}

const initialState = {
  stages: null,
  selectedStages: null,
  loading: true,
  error: '',
}

const cropstagesReducer = (state, action) => {
  if (action.type === ACTIONS.LOAD) {
    return {
      ...state,
      loading: true,
      error: '',
    }
  }

  if (action.type === ACTIONS.FETCH_SUCCESS) {
    return {
      ...state,
      loading: false,
      stages: action.payload,
    }
  }

  if (action.type === ACTIONS.FETCH_ERROR) {
    return {
      ...state,
      stages: null,
      error: action.payload,
    }
  }

  if (action.type === ACTIONS.SET) {
    return { ...state, selectedStages: action.payload }
  }

  throw new Error('Invalid action type')
}

export default function useFetchCropStages(type, cropType) {
  const [state, dispatch] = useReducer(cropstagesReducer, initialState)
  const { loadingCrops, cropList } = useFetchCrops()

  useEffect(() => {
    const load = async (crops = []) => {
      try {
        const queries = []
        crops = crops.filter((crop) => crop === cropType)
        crops.forEach((item) => queries.push(getCropStages(type, item)))

        const stages = await Promise.all(queries)

        dispatch({
          type: ACTIONS.FETCH_SUCCESS,
          payload: crops.reduce(
            (list, item, index) => ({ ...list, [item]: stages[index].data }),
            {},
          ),
        })
      } catch (err) {
        dispatch({
          type: ACTIONS.FETCH_ERROR,
          payload: err?.response?.data ?? err?.message,
        })
      }
    }

    if (!loadingCrops && cropList?.length > 0) {
      load(cropList)
    }
  }, [type, cropType, cropList, loadingCrops])

  useEffect(() => {
    if (cropType && state.stages) {
      dispatch({
        type: ACTIONS.SET,
        payload: state.stages?.[cropType] ?? null,
      })
    }
  }, [cropType, state.stages])

  return state
}
