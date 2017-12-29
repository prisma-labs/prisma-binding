import { Binding } from 'graphql-binding'
import { Exists, GraphcoolOptions } from './types'
import { sign } from 'jsonwebtoken'
import { makeGraphcoolLink } from './link'
import { SchemaCache } from 'graphql-schema-cache'
import { GraphQLSchema } from 'graphql'
import { buildExistsInfo } from './info'
import { delegateToSchema } from 'graphql-tools'
import { importSchema } from 'graphql-import'

const schemaCache = new SchemaCache()
const typeDefsCache: { [schemaPath: string]: string } = {}

export class Graphcool extends Binding {
  exists: Exists

  constructor({
    schemaPath,
    typeDefs,
    endpoint,
    secret,
    fragmentReplacements,
    debug,
  }: GraphcoolOptions) {
    if (!schemaPath && !typeDefs) {
      throw new Error('Provide either schemaPath or typeDefs')
    }

    if (schemaPath) {
      typeDefs = getCachedTypeDefs(schemaPath)
    }

    fragmentReplacements = fragmentReplacements || {}

    debug = debug || false

    const token = sign({}, secret)
    const link = makeGraphcoolLink({ endpoint, token, debug })

    const remoteSchema = schemaCache.makeExecutableSchema({
      link,
      typeDefs: typeDefs!,
      key: endpoint,
    })

    super({ schema: remoteSchema, fragmentReplacements })

    this.exists = new Proxy({}, new ExistsHandler(remoteSchema))
  }
}

class ExistsHandler implements ProxyHandler<Graphcool> {
  constructor(private schema: GraphQLSchema) {}

  get(target, rootFieldName: string) {
    return async (where: { [key: string]: any }): Promise<boolean> => {
      const args = { where }
      const info = buildExistsInfo(rootFieldName, this.schema)
      const result: any[] = await delegateToSchema(
        this.schema,
        {},
        'query',
        rootFieldName,
        args,
        {},
        info,
      )

      return result.length > 0
    }
  }
}

function getCachedTypeDefs(schemaPath: string): string {
  if (typeDefsCache[schemaPath]) {
    return typeDefsCache[schemaPath]
  }

  const schema = importSchema(schemaPath)
  typeDefsCache[schemaPath] = schema

  return schema
}
