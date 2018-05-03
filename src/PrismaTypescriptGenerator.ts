import { TypescriptGenerator } from 'graphql-binding'
import { printSchema } from 'graphql'

export class PrismaTypescriptGenerator extends TypescriptGenerator {
  constructor(options) {
    super(options)
  }
  render() {
    return this.compile`\
${this.renderImports()}

interface BindingInstance {
  query: ${this.renderQueries()}
  mutation: ${this.renderMutations()}
  subscription: ${this.renderSubscriptions()}
}

interface BindingConstructor<T> {
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
import { GraphQLResolveInfo } from 'graphql'
import { makeBinding, BasePrismaOptions } from 'prisma-binding'`
  }
  renderExports() {
    return `export const Prisma = makeBinding<BindingConstructor<BindingInstance>>(typeDefs)`
  }
  renderTypedefs() {
    return (
      'const typeDefs = `' + printSchema(this.schema).replace(/`/g, '\\`') + '`'
    )
  }
}
