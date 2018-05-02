import { TypescriptGenerator } from 'graphql-binding'
import { printSchema } from 'graphql'

export class PrismaGenerator extends TypescriptGenerator {
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
  new(secret: string): T
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
import { makeBinding } from 'prisma-binding'`
  }
  renderExports() {
    return `export const Binding = makeBinding(typeDefs)`
  }
  renderTypedefs() {
    return (
      'const typeDefs = `' + printSchema(this.schema).replace(/`/g, '\\`') + '`'
    )
  }
}
