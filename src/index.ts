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
import { FragmentReplacements } from './extractFragmentReplacements'

export { extractFragmentReplacements } from './extractFragmentReplacements'
export { DateTimeResolver as DateTime } from './DateTimeResolver'

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

export interface GraphcoolOptions {
  fragmentReplacements?: FragmentReplacements
  schema: string
  endpoint: string
  secret: string
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
    schema,
    endpoint,
    secret,
    fragmentReplacements,
  }: GraphcoolOptions) {
    fragmentReplacements = fragmentReplacements || {}

    const typeDefs = getCachedTypeDefs(schema)
    const link = new GraphcoolLink(endpoint, secret)

    const remoteSchema = schemaCache.makeExecutableSchema({
      link,
      typeDefs,
      key: endpoint,
    })

    this.query = new Proxy(
      {},
      new QueryHandler(remoteSchema, fragmentReplacements),
    )
    this.mutation = new Proxy(
      {},
      new MuationHandler(remoteSchema, fragmentReplacements),
    )
    this.exists = new Proxy({}, new ExistsHandler(remoteSchema))

    this.remoteSchema = remoteSchema
    this.fragementReplacements = fragmentReplacements
    this.graphqlClient = new GraphQLClient(endpoint, {
      headers: { Authorization: `Bearer ${secret}` },
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

class QueryHandler implements ProxyHandler<Graphcool> {
  constructor(
    private schema: GraphQLSchema,
    private fragmentReplacements: FragmentReplacements,
  ) {}

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

      return delegateToSchema(
        this.schema,
        this.fragmentReplacements,
        operation,
        prop,
        args,
        {},
        info,
      )
    }
  }
}

class MuationHandler implements ProxyHandler<Graphcool> {
  constructor(
    private schema: GraphQLSchema,
    private fragmentReplacements: FragmentReplacements,
  ) {}

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

      return delegateToSchema(
        this.schema,
        this.fragmentReplacements,
        operation,
        prop,
        args,
        {},
        info,
      )
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
