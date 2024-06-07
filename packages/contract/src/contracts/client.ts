import { initContract } from '@ts-rest/core'

// https://github.com/ts-rest/ts-rest/issues/409#issuecomment-1814025099
type ContractInstance = ReturnType<typeof initContract>
export const client: ContractInstance = initContract()
