import { Prisma as BaseBinding } from './Prisma'
import { BasePrismaOptions } from '.'

export function makeBindingClass<T>(typeDefs: string): T {
  return class Binding extends BaseBinding {
    constructor(options: BasePrismaOptions) {
      super({ typeDefs, ...options })
    }
  } as any
}
