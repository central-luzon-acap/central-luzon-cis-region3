import axios from 'axios'
import RequestObject from '@/utils/requestobject'

export class CropRecommendationsUpload extends RequestObject {
  async upsertCropRecommendations (body, cropName) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url: `${process.env.BASE_API_URL}/uploadCropRecommendations/${cropName}`, method: 'POST' })
    return res.data
  }
}