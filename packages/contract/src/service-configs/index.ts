import { FormConfig } from '../form'
import { applicationFortesting } from './application-for-testing'

export const serviceConfigs: Record<string, FormConfig<any, any>> = {
  'application-for-testing': applicationFortesting,
}
