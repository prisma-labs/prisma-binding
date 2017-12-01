import { Remote, extractDocumentAndVariableValues } from 'graphql-remote'
import {
  GraphQLResolveInfo,
  ExecutionResult,
  GraphQLObjectType,
  FieldNode,
  SelectionNode,
} from 'graphql'
import { importSchema } from 'graphql-import'
import { GraphcoolLink } from './GraphcoolLink'
import { isScalar } from './utils'
import { GraphQLSchema } from 'graphql/type/schema'

const schemaCache: { [schemaPath: string]: string } = {}

function getTypeDefs(schemaPath: string): string {
  if (schemaCache[schemaPath]) {
    return schemaCache[schemaPath]
  }

  const schema = importSchema(schemaPath)
  schemaCache[schemaPath] = schema

  return schema
}

function extractTypeName(rootField: string): string {
  if (rootField.startsWith('all')) {
    return rootField.slice(3, -1)
  }

  return rootField.replace(/^(create|update|delete)/, '')
}

function prepareInfoForQueryOrMutation(
  rootField: string,
  schema: GraphQLSchema,
  operation: 'query' | 'mutation',
): GraphQLResolveInfo {
  const typeName = extractTypeName(rootField)
  const type = schema.getType(typeName) as GraphQLObjectType
  const fields = type.getFields()
  const selections = Object.keys(fields)
    .filter(f => isScalar(fields[f].type))
    .map<FieldNode>(fieldName => {
      const field = fields[fieldName]
      return {
        kind: 'Field',
        name: { kind: 'Name', value: field.name },
      }
    })
  const fieldNode: FieldNode = {
    kind: 'Field',
    name: { kind: 'Name', value: rootField },
    selectionSet: { kind: 'SelectionSet', selections },
  }

  return {
    fieldNodes: [fieldNode],
    fragments: {},
    // the following fields are not needed for graphql-remote
    schema,
    fieldName: rootField,
    returnType: type,
    parentType: schema.getQueryType(),
    path: undefined,
    rootValue: null,
    operation: {
      kind: 'OperationDefinition',
      operation,
      selectionSet: { kind: 'SelectionSet', selections: [] },
    },
    variableValues: {},
  }
}

function prepareInfoForExistsQuery(
  typeName: string,
  schema: GraphQLSchema,
): GraphQLResolveInfo {
  const rootField = `all${typeName}s`
  const type = schema.getType(typeName) as GraphQLObjectType
  const fieldNode: FieldNode = {
    kind: 'Field',
    name: { kind: 'Name', value: rootField },
    selectionSet: {
      kind: 'SelectionSet',
      selections: [
        {
          kind: 'Field',
          name: { kind: 'Name', value: 'id' },
        },
      ],
    },
  }

  return {
    fieldNodes: [fieldNode],
    fragments: {},
    // the following fields are not needed for graphql-remote
    schema,
    fieldName: rootField,
    returnType: type,
    parentType: schema.getQueryType(),
    path: undefined,
    rootValue: null,
    operation: {
      kind: 'OperationDefinition',
      operation: 'query',
      selectionSet: { kind: 'SelectionSet', selections: [] },
    },
    variableValues: {},
  }
}

type Variables = { [key: string]: any }

export class Graphcool {
  private remote: Remote

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

    this.remote = new Remote(new GraphcoolLink(endpoint, apikey), { typeDefs })

    return new Proxy(this, this)
  }

  request<T extends any>(
    query: string,
    variables?: { [key: string]: any },
    operationName?: string,
  ): Promise<T> {
    return this.remote.request(query, variables, operationName)
  }

  get(target, prop: string) {
    const schema = this.remote.getSchema()
    if (prop.endsWith('Exists')) {
      return async (filter: { [key: string]: any }): Promise<boolean> => {
        const typeName = prop.replace(/Exists$/, '')
        const rootField = `all${typeName}s`
        const result = await this.remote.delegateQuery(
          rootField,
          { filter },
          {},
          prepareInfoForExistsQuery(typeName, schema),
        )

        console.log(result)

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
        return this.remote.delegateMutation(
          prop,
          args,
          {},
          info || prepareInfoForQueryOrMutation(prop, schema, 'mutation'),
        )
      }

      return this.remote.delegateQuery(
        prop,
        args,
        {},
        info || prepareInfoForQueryOrMutation(prop, schema, 'query'),
      )
    }
  }
}
