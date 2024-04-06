import { ServiceConfig } from '../types/service'
import { stepperFormConfig } from './stepper-form'
import { testServiceConfig } from './test'

export const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  test: testServiceConfig,
  stepper: stepperFormConfig,
  'application-for-registration-of-marriage': stepperFormConfig,
}
