import { GraphQLObjectType, GraphQLFieldMap } from 'graphql'

import { javascriptGenerator, Generator } from 'graphql-codegen-binding'
import { isWrappingType } from 'graphql'
import { isListType } from 'graphql'
import { GraphQLInputObjectType } from 'graphql'

export const generator: Generator = {
  ...javascriptGenerator,
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
  return `const { Prisma } = require('prisma-binding')
const { GraphQLResolveInfo } = require('graphql')
const typeDefs = \`
${schema}\``
}

function renderMainMethod(
  queryType: GraphQLObjectType,
  mutationType?: GraphQLObjectType | null,
  subscriptionType?: GraphQLObjectType | null,
) {
  return `module.exports.Prisma = class Binding extends Prisma {
  
  constructor({ endpoint, secret, fragmentReplacements, debug }) {
    super({ typeDefs, endpoint, secret, fragmentReplacements, debug });
    var self = this
    this.exists = {
${renderExistsFields(queryType.getFields())}
    }
    this.query = {
${javascriptGenerator.MainFields!('query', queryType.getFields())}
    }${
      mutationType
        ? `
      
    this.mutation = {
${javascriptGenerator.MainFields!('mutation', mutationType.getFields())}
    }`
        : ''
    }${
    subscriptionType
      ? `
      
    this.subscription = {
${javascriptGenerator.MainSubscriptionFields!(subscriptionType.getFields())}
    }`
      : ''
  }
  }
  
  delegate(operation, field, args, context, info) {
    return super.delegate(operation, field, args, context, info)
  }
}`
}
