import {
  GraphQLResolveInfo,
  ExecutionResult,
  GraphQLSchema,
  InlineFragmentNode,
} from 'graphql'
import { request, GraphQLClient } from 'graphql-request'
import { GraphcoolLink } from './GraphcoolLink'
import { importSchema } from 'graphql-import'
import { SchemaCache } from 'graphql-schema-cache'
import { delegateToSchema, makeRemoteExecutableSchema } from 'graphql-tools'
import {
  buildTypeLevelInfo,
  buildExistsInfo,
  buildFragmentInfo,
} from './prepareInfo'

export interface Query {
  [rootField: string]: <T = any>(
    args?: any,
    info?: GraphQLResolveInfo | string,
  ) => Promise<T>
}

export interface Exists {
  [rootField: string]: (
    args?: any,
    info?: GraphQLResolveInfo | string,
  ) => Promise<boolean>
}

const typeDefsCache: { [schemaPath: string]: string } = {}
const schemaCache = new SchemaCache()

// TODO extra case: use `ctx.db.Place({ id }, query)` but delegate to a sub type (aggregate)
export class Graphcool {
  query: Query
  mutation: Query
  exists: Exists

  private remoteSchema: GraphQLSchema
  private graphqlClient: GraphQLClient

  constructor({
    schema,
    endpoint,
    apikey,
  }: {
    schema: string
    endpoint: string
    apikey: string
  }) {
    const typeDefs = getCachedTypeDefs(schema)
    const link = new GraphcoolLink(endpoint, apikey)

    const remoteSchema = schemaCache.makeExecutableSchema({
      link,
      typeDefs,
      key: endpoint,
    })

    this.query = new Proxy({}, new QueryHandler(remoteSchema))
    this.mutation = new Proxy({}, new MuationHandler(remoteSchema))
    this.exists = new Proxy({}, new ExistsHandler(remoteSchema))

    this.remoteSchema = remoteSchema
    this.graphqlClient = new GraphQLClient(endpoint, {
      headers: { Authorization: `Bearer ${apikey}` },
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
      {},
      operation,
      fieldName,
      args,
      context,
      info,
    )
  }
}

class QueryHandler implements ProxyHandler<Graphcool> {
  constructor(private schema: GraphQLSchema) {}

  get(target, prop: string) {
    return (
      args: { [key: string]: any },
      info?: GraphQLResolveInfo,
    ): Promise<ExecutionResult> => {
      const operation = 'query'
      if (!info) {
        info = buildTypeLevelInfo(prop, this.schema, operation)
      } else if (typeof info === 'string') {
        info = buildFragmentInfo(prop, this.schema, operation, info)
      }
      return delegateToSchema(this.schema, {}, operation, prop, args, {}, info)
    }
  }
}

class MuationHandler implements ProxyHandler<Graphcool> {
  constructor(private schema: GraphQLSchema) {}

  get(target, prop: string) {
    return (
      args: { [key: string]: any },
      info?: GraphQLResolveInfo | string,
    ): Promise<ExecutionResult> => {
      const operation = 'mutation'
      if (!info) {
        info = buildTypeLevelInfo(prop, this.schema, operation)
      } else if (typeof info === 'string') {
        info = buildFragmentInfo(prop, this.schema, operation, info)
      }
      return delegateToSchema(this.schema, {}, operation, prop, args, {}, info)
    }
  }
}

class ExistsHandler implements ProxyHandler<Graphcool> {
  constructor(private schema: GraphQLSchema) {}

  get(target, prop: string) {
    return async (filter: { [key: string]: any }): Promise<boolean> => {
      const rootField = `all${prop}s`
      const args = { filter }
      const info = buildExistsInfo(prop, this.schema)
      const result: any[] = await delegateToSchema(
        this.schema,
        {},
        'query',
        rootField,
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
