import * as fs from 'fs'
import { GraphQLEndpoint } from 'graphql-config'
import { makeBinding } from './makeBinding'
import { GeneratorType } from './types'
import * as mkdirp from 'mkdirp'
import * as path from 'path'

export interface CodeGenerationInput {
  schemaPath?: string
  schema?: string
  endpoint?: string
  generator: GeneratorType
  target: string
  headers?: any
}

export async function generateCode(argv: CodeGenerationInput) {
  if (!argv.schema && !argv.schemaPath && !argv.endpoint) {
    throw new Error(
      'Please either provide the schema or the endpoint you want to get the schema from.',
    )
  }

  const schema = argv.schema
    ? argv.schema
    : argv.schemaPath
      ? fs.readFileSync(argv.schemaPath, 'utf-8')
      : await downloadFromEndpointUrl(argv)

  const code = makeBinding(schema, argv.generator)
  mkdirp(path.dirname(argv.target))
  fs.writeFileSync(argv.target, code)
}

function downloadFromEndpointUrl(argv) {
  const endpoint = new GraphQLEndpoint({
    url: argv.endpoint,
    headers: argv.headers,
  })

  return endpoint.resolveSchemaSDL()
}
