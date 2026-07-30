import { Bulletin } from './bulletin'

const BL = new Bulletin()

export const deleteBulletin = BL.deleteBulletin.bind(BL)
export const getBulletins = BL.getBulletins.bind(BL)
export const cancelAxiosRequest = BL.cancelAxiosRequest.bind(BL)
