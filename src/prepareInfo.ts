import {
  GraphQLResolveInfo,
  GraphQLObjectType,
  FieldNode,
  GraphQLSchema,
  SelectionSetNode,
  parse,
} from 'graphql'
import { isScalar, getTypeForRootFieldName } from './utils'
import { createDocument } from 'graphql-tools/dist/stitching/delegateToSchema'

export function buildTypeLevelInfo(
  rootFieldName: string,
  schema: GraphQLSchema,
  operation: 'query' | 'mutation',
): GraphQLResolveInfo {
  const type = getTypeForRootFieldName(rootFieldName, operation, schema)
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
    name: { kind: 'Name', value: rootFieldName },
    selectionSet: { kind: 'SelectionSet', selections },
  }

  return {
    fieldNodes: [fieldNode],
    fragments: {},
    schema,
    fieldName: rootFieldName,
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

export function buildFragmentInfo(
  rootFieldName: string,
  schema: GraphQLSchema,
  operation: 'query' | 'mutation',
  query: string,
): GraphQLResolveInfo {
  const type = getTypeForRootFieldName(rootFieldName, operation, schema)
  const fields = type.getFields()
  const fieldNode: FieldNode = {
    kind: 'Field',
    name: { kind: 'Name', value: rootFieldName },
    selectionSet: extractQuerySelectionSet(query),
  }

  return {
    fieldNodes: [fieldNode],
    fragments: {},
    schema,
    fieldName: rootFieldName,
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

export function buildExistsInfo(
  typeName: string,
  schema: GraphQLSchema,
): GraphQLResolveInfo {
  const rootFieldName = `all${typeName}s`
  const type = schema.getType(typeName) as GraphQLObjectType
  const fieldNode: FieldNode = {
    kind: 'Field',
    name: { kind: 'Name', value: rootFieldName },
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
    schema,
    fieldName: rootFieldName,
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

function extractQuerySelectionSet(query: string): SelectionSetNode {
  const document = parse(query)
  const queryNode = document.definitions[0]
  if (
    !queryNode ||
    queryNode.kind !== 'OperationDefinition' ||
    queryNode.operation !== 'query'
  ) {
    throw new Error(`Invalid query: ${query}`)
  }

  return queryNode.selectionSet
}
