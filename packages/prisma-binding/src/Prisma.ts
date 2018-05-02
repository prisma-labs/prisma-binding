import { Binding } from 'graphql-binding'
import { Exists, PrismaOptions, QueryMap, SubscriptionMap } from './types'
import { sign } from 'jsonwebtoken'
import { makePrismaLink } from './link'
import { buildExistsInfo } from './info'
import { importSchema } from 'graphql-import'
import { GraphQLSchema } from 'graphql'
import { SharedLink } from './SharedLink'
import { makeRemoteExecutableSchema } from 'graphql-tools'
import { getTypesAndWhere } from './utils'

const typeDefsCache: { [schemaPath: string]: string } = {}
const remoteSchemaCache: { [typeDefs: string]: GraphQLSchema } = {}

const sharedLink = new SharedLink()

export class Prisma extends Binding<QueryMap, SubscriptionMap> {
  exists: Exists

  constructor({
    typeDefs,
    endpoint,
    secret,
    fragmentReplacements,
    debug,
  }: PrismaOptions) {
    if (!typeDefs) {
      throw new Error('No `typeDefs` provided when calling `new Prisma()`')
    }

    if (typeDefs.endsWith('.graphql')) {
      typeDefs = getCachedTypeDefs(typeDefs)
    }

    if (endpoint === undefined) {
      throw new Error(
        `No Prisma endpoint found. Please provide the \`endpoint\` constructor option.`,
      )
    }

    if (!endpoint!.startsWith('http')) {
      throw new Error(`Invalid Prisma endpoint provided: ${endpoint}`)
    }

    if (secret === undefined) {
      throw new Error(
        `No Prisma secret found. Please provide the \`secret\` constructor option.`,
      )
    }

    fragmentReplacements = fragmentReplacements || {}

    debug = debug || false

    const token = sign({}, secret!)
    const link = makePrismaLink({ endpoint: endpoint!, token, debug })

    const remoteSchema = getCachedRemoteSchema(typeDefs, sharedLink)

    const before = () => {
      sharedLink.setInnerLink(link)
    }

    super({
      schema: remoteSchema,
      fragmentReplacements,
      before,
    })

    this.exists = this.buildExists()
  }

  private buildExists(): Exists {
    const queryType = this.schema.getQueryType()
    if (!queryType) {
      return {}
    }
    if (queryType) {
      const types = getTypesAndWhere(queryType)

      return types.reduce((acc, { type, pluralFieldName }) => {
        return {
          ...acc,
          [type]: args =>
            this.delegate(
              'query',
              pluralFieldName,
              args,
              buildExistsInfo(pluralFieldName, this.schema),
            ).then(res => res.length > 0),
        }
      }, {})
    }

    return {}
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

function getCachedRemoteSchema(
  typeDefs: string,
  link: SharedLink,
): GraphQLSchema {
  if (remoteSchemaCache[typeDefs]) {
    return remoteSchemaCache[typeDefs]
  }

  const remoteSchema = makeRemoteExecutableSchema({
    link: sharedLink,
    schema: typeDefs,
  })
  remoteSchemaCache[typeDefs] = remoteSchema

  return remoteSchema
}
