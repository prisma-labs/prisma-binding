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
const { makePrismaBindingClass } = require('prisma-binding')`
  }
  renderExports() {
    return `\
const Prisma = makePrismaBindingClass({ typeDefs })
module.exports = { Prisma }`
  }
  renderTypedefs() {
    return (
      'const typeDefs = `' + printSchema(this.schema).replace(/`/g, '\\`') + '`'
    )
  }
}
