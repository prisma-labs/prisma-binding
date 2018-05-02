import { Prisma as BaseBinding } from './Prisma'

export function makeBinding<T>(typeDefs: string): T {
  return class Binding extends BaseBinding {
    constructor(secret?: string) {
      super({ typeDefs, secret })
    }
  } as any
}
