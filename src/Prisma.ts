import { Binding } from 'graphql-binding'
import { Exists, PrismaOptions, QueryMap, SubscriptionMap } from './types'
import { sign } from 'jsonwebtoken'
import { makePrismaLink } from './link'
import { GraphQLResolveInfo, isListType, isWrappingType } from 'graphql'
import { buildExistsInfo } from './info'
import { importSchema } from 'graphql-import'
import { GraphQLNamedType, GraphQLSchema } from 'graphql'
import { SharedLink } from './SharedLink'
import { makeRemoteExecutableSchema } from 'graphql-tools'
import { Handler, SubscriptionHandler } from './Handler'

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

    fragmentReplacements = fragmentReplacements || {}

    debug = debug || false

    const token = secret ? sign({}, secret) : undefined
    const link = makePrismaLink({ endpoint: endpoint!, token, debug })

    const remoteSchema = getCachedRemoteSchema(typeDefs, sharedLink)

    const before = () => {
      sharedLink.setInnerLink(link)
    }

    super({
      schema: remoteSchema,
      fragmentReplacements,
      before,
      handler: Handler,
      subscriptionHandler: SubscriptionHandler,
    })

    this.exists = new Proxy(
      {},
      new ExistsHandler(remoteSchema, this.existsDelegate.bind(this)),
    )
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
    info?: GraphQLResolveInfo | string,
  ): Promise<boolean> {
    this.before()
    return this.delegate(operation, fieldName, args, context, info).then(
      res => res.length > 0,
    )
  }
}

class ExistsHandler implements ProxyHandler<Prisma> {
  constructor(private schema: GraphQLSchema, private delegate: any) {}

  get(target: any, typeName: string) {
    return async (where: { [key: string]: any }): Promise<boolean> => {
      const rootFieldName: string = this.findRootFieldName(
        typeName,
        this.schema,
      )
      const args = { where }
      const info = buildExistsInfo(rootFieldName, this.schema)
      return this.delegate('query', rootFieldName, args, {}, info)
    }
  }

  findRootFieldName(typeName: string, schema: GraphQLSchema): string {
    const fields = schema.getQueryType().getFields()

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
