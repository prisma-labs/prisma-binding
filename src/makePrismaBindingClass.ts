import { Prisma as BaseBinding } from './Prisma'
import { BasePrismaOptions } from '.'

export function makePrismaBindingClass<T>({
  typeDefs,
}: {
  typeDefs: string
}): T {
  return class Binding extends BaseBinding {
    constructor(options: BasePrismaOptions) {
      super({ typeDefs, ...options })
    }
  } as any
}
