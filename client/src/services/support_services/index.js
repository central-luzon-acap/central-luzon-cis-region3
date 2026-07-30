import { SupportServices } from './support_services'

const SS = new SupportServices()

export const getSupportServices = SS.getSupportServices.bind(SS)
export const addSupportService = SS.addSupportService.bind(SS)
export const updateSupportService = SS.updateSupportService.bind(SS)
export const deleteSupportService = SS.deleteSupportService.bind(SS)
