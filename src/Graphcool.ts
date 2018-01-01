import { Binding } from 'graphql-binding'
import { Exists, GraphcoolOptions } from './types'
import { sign } from 'jsonwebtoken'
import { makeGraphcoolLink } from './link'
import { SchemaCache } from 'graphql-schema-cache'
import { GraphQLResolveInfo } from 'graphql'
import { buildExistsInfo } from './info'
import { importSchema } from 'graphql-import'

const schemaCache = new SchemaCache()
const typeDefsCache: { [schemaPath: string]: string } = {}

export class Graphcool extends Binding {
  exists: Exists

  constructor({ typeDefs, endpoint, secret, fragmentReplacements, debug }: GraphcoolOptions) {
    if (!typeDefs) {
      throw new Error('No `typeDefs` provided when calling `new Graphcool()`')
    }

    if (typeDefs.endsWith('.graphql')) {
      typeDefs = getCachedTypeDefs(typeDefs)
    }

    if (endpoint === undefined) {
      if (process.env.GRAPHCOOL_ENDPOINT) {
        endpoint = process.env.GRAPHCOOL_ENDPOINT
      } else {
        throw new Error(
          `No Graphcool endpoint found. Either provide \`endpoint\` constructor option or set \`GRAPHCOOL_ENDPOINT\` env var.`
        )
      }
    }

    if (!endpoint!.startsWith('http')) {
      throw new Error(`Invalid Graphcool endpoint provided: ${endpoint}`)
    }

    if (secret === undefined) {
      if (process.env.GRAPHCOOL_SECRET) {
        secret = process.env.GRAPHCOOL_SECRET
      } else {
        throw new Error(
          `No Graphcool secret found. Either provide \`secret\` constructor option or set \`GRAPHCOOL_SECRET\` env var.`
        )
      }
    }

    fragmentReplacements = fragmentReplacements || {}

    debug = debug || false

    const token = sign({}, secret!)
    const link = makeGraphcoolLink({ endpoint: endpoint!, token, debug })

    const remoteSchema = schemaCache.makeExecutableSchema({
      link,
      typeDefs,
      key: endpoint!
    })

    super({ schema: remoteSchema, fragmentReplacements })

    this.exists = new Proxy({}, new ExistsHandler())
  }

  existsDelegate(
    operation: 'query' | 'mutation',
    fieldName: string,
    args: {
      [key: string]: any
    },
    context: {
      [key: string]: any
    },
    info?: GraphQLResolveInfo | string
  ): Promise<boolean> {
    return super.delegate(operation, fieldName, args, context, info).then(res => res.length > 0)
  }
}

class ExistsHandler implements ProxyHandler<Graphcool> {
  get(target: Graphcool, rootFieldName: string) {
    return async (where: { [key: string]: any }): Promise<boolean> => {
      const args = { where }
      const info = buildExistsInfo(rootFieldName, target.schema)
      return target.existsDelegate(
        'query',
        rootFieldName,
        args,
        {},
        info
      )
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
