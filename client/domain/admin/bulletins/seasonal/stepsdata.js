import { REGION_NAME } from '@/utils/constants'

const steps = [
  {
    label: 'Select a province',
    description: `Select a province within the ${REGION_NAME} region.`,
    opt_name: 'sel_province'
  },
  {
    label: 'Select a municipality',
    description:
      'Select a municipality included in the province you have selected on step no. 1.',
    opt_name: 'sel_municipality'
  },
  {
    label: 'Select a crop type',
    description: 'Listed below are available crops for your selected province and municipality.',
    opt_name: 'sel_crop'
  },
  {
    label: 'Select a month',
    description: 'Select a target month from the current Seasonal Weather Forecast.',
    opt_name: 'sel_month'
  },
  {
    label: 'Select crop stages',
    description:
      'Listed below are the available crop stages for your selected crop on the target month.',
    opt_name: 'sel_stage'
  },
  {
    label: 'Select activities',
    description: 'Here are available activities for the previously-selected parameters.',
    opt_name: 'sel_activity'
  },
]

export default steps
