import { GraphQLResolveInfo, GraphQLSchema, ExecutionResult } from 'graphql'
import { delegateToSchema } from 'graphql-tools'
import { SchemaCache } from 'graphql-schema-cache'
import { importSchema } from 'graphql-import'
import { GraphcoolLink } from './GraphcoolLink'
import {
  prepareInfoForQueryOrMutation,
  prepareInfoForExistsQuery,
} from './prepareInfo'

const typeDefsCache: { [schemaPath: string]: string } = {}
const schemaCache = new SchemaCache()

export class Graphcool {
  private remoteSchema: GraphQLSchema

  // needed for dynamic function calls (should be replaced by codegen)
  [method: string]: any

  constructor({
    schema,
    endpoint,
    apikey,
  }: {
    schema: string
    endpoint: string
    apikey: string
  }) {
    const typeDefs = getTypeDefs(schema)
    const link = new GraphcoolLink(endpoint, apikey)

    this.remoteSchema = schemaCache.makeExecutableSchema({
      link,
      typeDefs,
      key: endpoint,
    })

    return new Proxy(this, this)
  }

  // TODO reimplement
  // request<T extends any>(
  //   query: string,
  //   variables?: { [key: string]: any },
  //   operationName?: string,
  // ): Promise<T> {
  //   return this.remote.request(query, variables, operationName)
  // }

  get(target, prop: string) {
    const schema = this.remoteSchema
    if (prop.endsWith('Exists')) {
      return async (filter: { [key: string]: any }): Promise<boolean> => {
        const typeName = prop.replace(/Exists$/, '')
        const rootField = `all${typeName}s`
        const result = await delegateToSchema(
          this.remoteSchema,
          {},
          'query',
          rootField,
          { filter },
          {},
          prepareInfoForExistsQuery(typeName, schema),
        )

        return (result as any).length > 0
      }
    }

    return (
      args: { [key: string]: any },
      info?: GraphQLResolveInfo,
    ): Promise<ExecutionResult> => {
      if (
        prop.startsWith('create') ||
        prop.startsWith('update') ||
        prop.startsWith('delete')
      ) {
        return delegateToSchema(
          this.remoteSchema,
          {},
          'mutation',
          prop,
          args,
          {},
          info || prepareInfoForQueryOrMutation(prop, schema, 'mutation'),
        )
      }

      return delegateToSchema(
        this.remoteSchema,
        {},
        'query',
        prop,
        args,
        {},
        info || prepareInfoForQueryOrMutation(prop, schema, 'query'),
      )
    }
  }
}

function getTypeDefs(schemaPath: string): string {
  if (typeDefsCache[schemaPath]) {
    return typeDefsCache[schemaPath]
  }

  const schema = importSchema(schemaPath)
  typeDefsCache[schemaPath] = schema

  return schema
}
