import { TypescriptGenerator } from 'graphql-binding'
import { printSchema } from 'graphql'
import { getExistsTypes } from './utils'

export class PrismaTypescriptGenerator extends TypescriptGenerator {
  constructor(options) {
    super(options)
  }
  render() {
    return this.compile`\
${this.renderImports()}

export interface Query ${this.renderQueries()}

export interface Mutation ${this.renderMutations()}

export interface Subscription ${this.renderSubscriptions()}

export interface Exists ${this.renderExists()}

export interface Prisma {
  query: Query
  mutation: Mutation
  subscription: Subscription
  exists: Exists
  request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>
  delegate(operation: 'query' | 'mutation', fieldName: string, args: {
    [key: string]: any;
}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<any>;
delegateSubscription(fieldName: string, args?: {
    [key: string]: any;
}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<AsyncIterator<any>>;
getAbstractResolvers(filterSchema?: GraphQLSchema | string): IResolvers;
}

export interface BindingConstructor<T> {
  new(options: BasePrismaOptions): T
}
/**
 * Type Defs
*/

${this.renderTypedefs()}

${this.renderExports()}

/**
 * Types
*/

${this.renderTypes()}`
  }
  renderImports() {
    return `\
import { GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import { IResolvers } from 'graphql-tools/dist/Interfaces'
import { Options } from 'graphql-binding'
import { makePrismaBindingClass, BasePrismaOptions } from 'prisma-binding'`
  }
  renderExports() {
    return `export const Prisma = makePrismaBindingClass<BindingConstructor<Prisma>>({typeDefs})`
  }
  renderTypedefs() {
    return (
      'const typeDefs = `' + printSchema(this.schema).replace(/`/g, '\\`') + '`'
    )
  }
  renderExists() {
    const queryType = this.schema.getQueryType()
    if (queryType) {
      return `{\n${getExistsTypes(queryType)}\n}`
    }
    return '{}'
  }
}
