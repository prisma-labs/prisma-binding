import { Generator } from 'graphql-binding'
import { printSchema } from 'graphql'

export class PrismaGenerator extends Generator {
  constructor(options) {
    super(options)
  }
  render() {
    return this.compile`\
${this.renderImports()}


/**
 * Type Defs
*/

${this.renderTypedefs()}

${this.renderExports()}
`
  }
  renderImports() {
    return `\
import { makeBinding } from 'prisma-binding'`
  }
  renderExports() {
    return `export const Prisma = makeBinding(typeDefs)`
  }
  renderTypedefs() {
    return (
      'const typeDefs = `' + printSchema(this.schema).replace(/`/g, '\\`') + '`'
    )
  }
}
