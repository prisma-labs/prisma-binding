import { GraphQLSchema } from 'graphql'
import { importSchema } from 'graphql-import'
import { SharedLink } from './SharedLink'
import { makeRemoteExecutableSchema } from 'graphql-tools'

const typeDefsCache: { [schemaPath: string]: string } = {}
const remoteSchemaCache: { [endpoint: string]: GraphQLSchema } = {}

export function getCachedTypeDefs(schemaPath: string): string {
  if (typeDefsCache[schemaPath]) {
    return typeDefsCache[schemaPath]
  }

  const schema = importSchema(schemaPath)
  typeDefsCache[schemaPath] = schema

  return schema
}

export function getCachedRemoteSchema(
  endpoint: string,
  typeDefs: string,
  link: SharedLink,
): GraphQLSchema {
  if (remoteSchemaCache[endpoint]) {
    return remoteSchemaCache[endpoint]
  }

  const remoteSchema = makeRemoteExecutableSchema({
    link: link,
    schema: typeDefs,
  })
  remoteSchemaCache[endpoint] = remoteSchema

  return remoteSchema
}
