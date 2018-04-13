import { GraphQLObjectType, GraphQLFieldMap } from 'graphql'

import { typescriptGenerator, Generator } from 'graphql-codegen-binding'
import { isWrappingType } from 'graphql'
import { isListType } from 'graphql'
import { GraphQLInputObjectType } from 'graphql'

export const generator: Generator = {
  ...typescriptGenerator,
  Main: renderMainMethod,
  Header: renderHeader,
}

const scalarMapping = {
  Int: 'number',
  String: 'string',
  ID: 'string | number',
  Float: 'number',
  Boolean: 'boolean',
}

export function renderExistsFields(fields: GraphQLFieldMap<any, any>): string {
  return Object.keys(fields)
    .map(f => {
      const field = fields[f]
      let type = field.type
      let foundList = false
      // Traverse the wrapping types (if any)
      while (isWrappingType(type)) {
        type = type.ofType
        // One of those wrappings need to be a GraphQLList for this field to qualify
        foundList = foundList || isListType(type)
      }
      if (foundList) {
        const whereType = (field.args.find(a => a.name === 'where')!
          .type as GraphQLInputObjectType).name
        return `    ${
          type.name
        }: (where: ${whereType}): Promise<boolean> => super.existsDelegate('query', '${
          field.name
        }', { where }, {}, '{ id }')`
      }
    })
    .filter(f => f)
    .join(',\n')
}

function renderHeader(schema: string): string {
  return `import { Prisma as BasePrisma, BasePrismaOptions } from 'prisma-binding'
import { GraphQLResolveInfo } from 'graphql'

export const typeDefs = \`
${schema}\``
}

function renderMainMethod(
  queryType: GraphQLObjectType,
  mutationType?: GraphQLObjectType | null,
  subscriptionType?: GraphQLObjectType | null,
) {
  return `export class Prisma extends BasePrisma {
  
  constructor({ endpoint, secret, fragmentReplacements, debug }: BasePrismaOptions) {
    super({ typeDefs, endpoint, secret, fragmentReplacements, debug });
  }

  exists = {
${renderExistsFields(queryType.getFields())}
  }

  query: Query = {
${typescriptGenerator.MainFields!('query', queryType.getFields())}
  }${
    mutationType
      ? `

  mutation: Mutation = {
${typescriptGenerator.MainFields!('mutation', mutationType.getFields())}
  }`
      : ''
  }${
    subscriptionType
      ? `

  subscription: Subscription = {
${typescriptGenerator.MainSubscriptionFields!(subscriptionType.getFields())}
  }`
      : ''
  }
}`
}
