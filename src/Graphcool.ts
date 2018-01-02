import { Binding } from 'graphql-binding'
import { Exists, GraphcoolOptions } from './types'
import { sign } from 'jsonwebtoken'
import { makeGraphcoolLink } from './link'
import { SchemaCache } from 'graphql-schema-cache'
import { GraphQLSchema, isWrappingType, isListType } from 'graphql'
import { buildExistsInfo } from './info'
import { delegateToSchema } from 'graphql-tools'
import { importSchema } from 'graphql-import'
import { GraphQLNamedType } from 'graphql';

const schemaCache = new SchemaCache()
const typeDefsCache: { [schemaPath: string]: string } = {}

export class Graphcool extends Binding {
  exists: Exists

  constructor({
    typeDefs,
    endpoint,
    secret,
    fragmentReplacements,
    debug,
  }: GraphcoolOptions) {
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
          `No Graphcool endpoint found. Either provide \`endpoint\` constructor option or set \`GRAPHCOOL_ENDPOINT\` env var.`,
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
          `No Graphcool secret found. Either provide \`secret\` constructor option or set \`GRAPHCOOL_SECRET\` env var.`,
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
      key: endpoint!,
    })

    super({ schema: remoteSchema, fragmentReplacements })

    this.exists = new Proxy({}, new ExistsHandler(remoteSchema))
  }
}

class ExistsHandler implements ProxyHandler<Graphcool> {
  constructor(private schema: GraphQLSchema) {}

  get(target, typeName: string) {
    return async (where: { [key: string]: any }): Promise<boolean> => {
      const rootFieldName: string = this.findRootFieldName(target, typeName)
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

  findRootFieldName(target: Graphcool, typeName: string): string {
    const fields = target.schema.getQueryType().getFields()
    
    // Loop over all query root fields
    for (const field in fields) {
      const fieldDef = fields[field]
      let type = fieldDef.type
      let foundList = false
      // Traverse the wrapping types (if any)
      while (isWrappingType(type)) {
        type = type.ofType
        // One of those wrappings need to be a GraphQLList for this field to qualify
        foundList = foundList || isListType(type)
      }
      if (foundList && (<GraphQLNamedType>type).name == typeName) {
        return fieldDef.name
      }
    }

    throw new Error(`No query root field found for type '${typeName}'`)
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
