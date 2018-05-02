import { GraphQLSchema } from 'graphql'
import { getExistsTypes } from './utils'

const Generator: any = null

export class PrismaGenerator extends Generator {
  importGenerators = [
    ...Generator.importGenerators,
    `import {Prisma as BasePrisma} from 'prisma-binding'`,
  ]

  bodyGenerators = [
    (schema: GraphQLSchema) => {
      const queryType = schema.getQueryType()
      if (!queryType) {
        return ''
      }

      return `exists: {
        ${getExistsTypes(queryType)}
      }`
    },
  ]
  exportGenerators = [
    () => `export const Prisma = applyTypes<Types>(BasePrisma)`,
  ]
}
