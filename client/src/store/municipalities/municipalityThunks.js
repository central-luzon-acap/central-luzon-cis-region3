import { createAsyncThunk } from '@reduxjs/toolkit'
import { getProvincesMunicipalities } from '@/services/region'
import { municipalitiesLoading } from '@/store/municipalities/municipalitySlice'

export const fetchMunicipalities = createAsyncThunk('municipalities/list',
  async (province, thunkAPI) => {
    thunkAPI.dispatch(municipalitiesLoading(thunkAPI.requestId))

    try {
      // Fetch the municipalities list by province from the 10-day weather data and strip results of the weather data
      // const response = await getTenDayProvince(province)

      // Fetch the municipalities list from the full masterlist of provinces and municipalities
      const response = await getProvincesMunicipalities()

      if (((response?.data.length) ?? 0) === 0 || !response) {
        thunkAPI.rejectWithValue('Received an empty weather data.')
      } else {
        return response?.data?.find(item =>
          item.label === province)?.municipalities ?? []
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
})
