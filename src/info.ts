import {
  GraphQLResolveInfo,
  GraphQLNonNull,
  FieldNode,
  GraphQLSchema,
  GraphQLList,
} from 'graphql'

export function buildExistsInfo(
  rootFieldName: string,
  schema: GraphQLSchema,
): GraphQLResolveInfo {
  const queryType = schema.getQueryType() || undefined!
  const type = queryType.getFields()[rootFieldName].type

  // make sure that just list types are queried
  if (
    !(type instanceof GraphQLNonNull) ||
    !(type.ofType instanceof GraphQLList)
  ) {
    throw new Error(`Invalid exist query: ${rootFieldName}`)
  }

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
    parentType: queryType,
    path: undefined!,
    rootValue: null,
    operation: {
      kind: 'OperationDefinition',
      operation: 'query',
      selectionSet: { kind: 'SelectionSet', selections: [] },
      variableDefinitions: [],
    },
    variableValues: {},
  }
}
