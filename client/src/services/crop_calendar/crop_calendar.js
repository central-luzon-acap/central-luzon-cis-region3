import FirestoreService from '@/utils/firestoreutils'

export const _CropCalendar = {
  CROP_CALENDARS: 'misc_crop_calendars',
  CROPPING_CALENDAR_MERGED: 'n_cropping_calendar_merged',
  CROPPING_CALENDAR_LITE: 'n_cropping_calendar_lite',
  CROPPING_CALENDAR_X: 'n_cropping_calendar_x',
  CROPPING_CALENDAR_SEASONAL_X: 'n_cropping_calendar_seasonal_x',
}

export class CropCalendar extends FirestoreService {
  /**
   * Fetch province data from the (simplified) cropping calendar data set
   * @param {String} province - Province name
   * @returns {Object[]} Cropping calendar data of all municipalities in a province
   */
  getCroppingCalendarProvince = async (province) =>
    await this.getDocumentData(_CropCalendar.CROPPING_CALENDAR_LITE, province)

  getCropList = async () => {
    return await this.getDocumentData(
      _CropCalendar.CROPPING_CALENDAR_X,
      'calendar',
    )
  }

  /**
   * Fetch province data from the complex cropping calendar data set.
   * The complex cropping calendar now has two data arrays for each municipality
   * since there are overlapping practices. This is for the Cropping Calendar v2.
   * @param {String} province - Province name
   * @returns {Object[]} Cropping calendar data of all municipalities in a province
   */
  getCroppingCalendarV2Province = async (type, province, cropName) => {
    const calendar =
      type === '10-day'
        ? _CropCalendar.CROPPING_CALENDAR_X
        : _CropCalendar.CROPPING_CALENDAR_SEASONAL_X

    const data = await this.getDocumentDataV2(
      `${calendar}/calendar/${cropName}`,
      province,
    )
    return data
  }

  getCropStages = async (type, cropName) => {
    const calendar =
      type === '10-day'
        ? _CropCalendar.CROPPING_CALENDAR_X
        : _CropCalendar.CROPPING_CALENDAR_SEASONAL_X
    const data = await this.getDocumentDataV2(
      `${calendar}/calendar/${cropName}`,
      'stages',
    )
    return data
  }

  /**
   * Fetch cropping calendar data with specified province and municipality.
   * Response may include multiple items for different crops.
   * @param {String} province - Province name
   * @param {String} municipality - Municipality name
   * @returns {Object[]} Cropping calendar data of a municipality.
   */
  getCroppingCalendarMunicipality = async (province, municipality) => {
    if (province === undefined || municipality === undefined) {
      return
    }

    try {
      const response = await this.getCroppingCalendarProvince(province)
      return (
        response?.data?.filter((item) => item.municipality === municipality) ??
        []
      )
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
