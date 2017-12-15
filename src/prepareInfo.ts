import { FieldNode, GraphQLObjectType, GraphQLResolveInfo, GraphQLSchema } from 'graphql';

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
