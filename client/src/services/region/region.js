import FirestoreService from '@/utils/firestoreutils'

export const _Region = {
  CONSTANTS: 'constant_data',
  VILLAGES: 'amia_villages',
  PROVINCES: 'provinces',
  PROVINCES_INFO: 'provinces_info',
  REGION: 'region'
}

export class Region extends FirestoreService {
  /**
   * Get a minimal province list without municipalities
   * @returns {Object[]} List of provinces
   */
  getProvinces = async () => {
    const result = await this.getDocumentData(_Region.CONSTANTS, _Region.PROVINCES)
    return result?.data?.map((province, id) => ({ id, name: province.label })) || []
  }

  /**
   * Get the minimal municipalities list (for Amia villages only) with lat/lon and other relevant info.
   * @returns {Object} { data, metadata }
   *    - data: {Object[]} List of AMIA villages following the format i.e:
   *      [{ id, association, barangay, lat, lon, municipality, province }...]
   *    - metadata: {Object} Data description and other relevant information
   */
  getVillages = async () =>
    await this.getDocumentData(_Region.CONSTANTS, _Region.VILLAGES)

  /**
   * Get provinces with municipalities list
   * @returns {Object} { data, metadata }
   *    - data: {Object[]} List of provinces containing a list of municipalities each i.e,
   *      [{ id: 0, label: "Albay", municipalities: [{ id: 0, label: "Bacacay" },...] },...]
   *    - metadata: {Object} Data description and other relevant information
   */
  getProvincesMunicipalities = async () =>
    await this.getDocumentData(_Region.CONSTANTS, _Region.PROVINCES)

  getRegion = async () =>
    await this.getDocumentData(_Region.CONSTANTS, _Region.REGION)
}
