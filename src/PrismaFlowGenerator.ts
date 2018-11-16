import { FlowGenerator } from 'graphql-binding'
import { printSchema } from 'graphql'
import { getExistsFlowTypes } from './utils'

export class PrismaFlowGenerator extends FlowGenerator {
  constructor(options) {
    super(options)
  }
  render() {
    return this.compile`\
/**
 * @flow
 */
${this.renderImports()}

export interface Query ${this.renderQueries()}

export interface Mutation ${this.renderMutations()}

export interface Subscription ${this.renderSubscriptions()}

export interface Exists ${this.renderExists()}

interface Prisma {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
  exists: Exists;
  request(query: string, variables?: {[key: string]: any}): Promise<any>;
  delegate(operation: 'query' | 'mutation', fieldName: string, args: {
    [key: string]: any;
}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<any>;
delegateSubscription(fieldName: string, args?: {
    [key: string]: any;
}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<AsyncIterator<any>>;
getAbstractResolvers(filterSchema?: GraphQLSchema | string): IResolvers;
}

export interface BindingConstructor<T> {
  new(options: BPOType): T
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
import type { GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import type { IResolvers } from 'graphql-tools/dist/Interfaces'
import type { Options } from 'graphql-binding'
import type { BasePrismaOptions as BPOType } from 'prisma-binding'
import { makePrismaBindingClass, BasePrismaOptions } from 'prisma-binding'`
  }
  renderExports() {
    return `const prisma: BindingConstructor<Prisma> = makePrismaBindingClass({typeDefs})
export { prisma as Prisma } 
`
  }
  renderTypedefs() {
    return (
      'const typeDefs = `' + printSchema(this.schema).replace(/`/g, '\\`') + '`'
    )
  }
  renderExists() {
    const queryType = this.schema.getQueryType()
    if (queryType) {
      return `{\n${getExistsFlowTypes(queryType)}\n}`
    }
    return '{}'
  }
}
