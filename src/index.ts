import { GraphQLSchema } from 'graphql';
import { importSchema } from 'graphql-import';
import { SchemaCache } from 'graphql-schema-cache';
import { delegateToSchema } from 'graphql-tools';
import { sign } from 'jsonwebtoken';
import { FragmentReplacements, Orm } from 'supergraph-orm';

import { GraphcoolLink } from './GraphcoolLink';
import { buildExistsInfo } from './prepareInfo';

export { DateTimeResolver as DateTime } from './DateTimeResolver'

export interface Exists {
  [rootField: string]: (filter: { [key: string]: any }) => Promise<boolean>
}

export interface GraphcoolOptions {
  fragmentReplacements?: FragmentReplacements
  schemaPath: string
  endpoint: string
  secret: string
}

const typeDefsCache: { [schemaPath: string]: string } = {}
const schemaCache = new SchemaCache()

// TODO extra case: use `ctx.db.Place({ id }, query)` but delegate to a sub type (aggregate)
export class Graphcool extends Orm {
  exists: Exists

  constructor({
    schemaPath,
    endpoint,
    secret,
    fragmentReplacements,
  }: GraphcoolOptions) {
    const typeDefs = getCachedTypeDefs(schemaPath)
    const token = sign({}, secret)
    const link = new GraphcoolLink(endpoint, token)

    const remoteSchema = schemaCache.makeExecutableSchema({
      link,
      typeDefs,
      key: endpoint,
    })

    super({executableSchema: remoteSchema, fragmentReplacements})

    this.exists = new Proxy({}, new ExistsHandler(remoteSchema))
  }
}

class ExistsHandler implements ProxyHandler<Graphcool> {
  constructor(private schema: GraphQLSchema) {}

  get(target, rootFieldName: string) {
    return async (filter: { [key: string]: any }): Promise<boolean> => {
      const args = { filter }
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
