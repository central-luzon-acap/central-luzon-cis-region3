import { createAsyncThunk } from '@reduxjs/toolkit'
import { getProvincesMunicipalities } from '@/services/region'
import { provincesLoading } from '@/store/provinces/provinceSlice'

export const fetchProvinces = createAsyncThunk('provinces/list',
  async (_, thunkAPI) => {
    thunkAPI.dispatch(provincesLoading(thunkAPI.requestId))

    try {
      const response = await getProvincesMunicipalities()

      if (((response?.data.length) ?? 0) === 0 || !response) {
        return thunkAPI.rejectWithValue('Received empty data')
      } else {
        return {
          provinces: response?.data?.map((province, id) => ({ id, label: province.label })) || [],
          municipalities: response?.data?.reduce((list, province) =>
            ({ ...list, [province.label]: province.municipalities }), {})
        }
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message)
    }
})
