import { GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import { sign } from 'jsonwebtoken'
import { GraphQLClient } from 'graphql-request'
import { makeGraphcoolLink } from './GraphcoolLink'
import { importSchema } from 'graphql-import'
import { SchemaCache } from 'graphql-schema-cache'
import { delegateToSchema } from 'graphql-tools'
import { buildExistsInfo } from './info'
import { makeProxy, FragmentReplacements } from 'graphql-binding'

export { extractFragmentReplacements } from 'graphql-binding'

export interface Query {
  [rootField: string]: <T = any>(
    args?: any,
    info?: GraphQLResolveInfo | string,
  ) => Promise<T>
}

export interface Exists {
  [rootField: string]: (filter: { [key: string]: any }) => Promise<boolean>
}

export interface GraphcoolOptions {
  fragmentReplacements?: FragmentReplacements
  schemaPath: string
  endpoint: string
  secret: string
  debug?: boolean
}

const typeDefsCache: { [schemaPath: string]: string } = {}
const schemaCache = new SchemaCache()

// TODO extra case: use `ctx.db.Place({ id }, query)` but delegate to a sub type (aggregate)
export class Graphcool {
  query: Query
  mutation: Query
  exists: Exists

  private remoteSchema: GraphQLSchema
  private fragementReplacements: FragmentReplacements
  private graphqlClient: GraphQLClient

  constructor({
    schemaPath,
    endpoint,
    secret,
    fragmentReplacements,
    debug,
  }: GraphcoolOptions) {
    fragmentReplacements = fragmentReplacements || {}

    debug = debug || false

    const typeDefs = getCachedTypeDefs(schemaPath)
    const token = sign({}, secret)
    const link = makeGraphcoolLink({ endpoint, token, debug })

    const remoteSchema = schemaCache.makeExecutableSchema({
      link,
      typeDefs,
      key: endpoint,
    })

    this.query = makeProxy<Query>({
      schema: remoteSchema,
      fragmentReplacements,
      operation: 'query',
    })
    this.mutation = makeProxy<Query>({
      schema: remoteSchema,
      fragmentReplacements,
      operation: 'mutation',
    })
    this.exists = new Proxy({}, new ExistsHandler(remoteSchema))

    this.remoteSchema = remoteSchema
    this.fragementReplacements = fragmentReplacements

    this.graphqlClient = new GraphQLClient(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  async request<T = any>(
    query: string,
    variables?: { [key: string]: any },
  ): Promise<T> {
    return this.graphqlClient.request<T>(query, variables)
  }

  async delegate(
    operation: 'query' | 'mutation' | 'subscription',
    fieldName: string,
    args: {
      [key: string]: any
    },
    context: {
      [key: string]: any
    },
    info: GraphQLResolveInfo,
  ) {
    return delegateToSchema(
      this.remoteSchema,
      this.fragementReplacements,
      operation,
      fieldName,
      args,
      context,
      info,
    )
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
