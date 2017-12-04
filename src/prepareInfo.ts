import {
  GraphQLResolveInfo,
  GraphQLObjectType,
  FieldNode,
  SelectionNode,
  GraphQLSchema,
  DocumentNode,
  OperationDefinitionNode,
  InlineFragmentNode,
  Kind,
  print,
} from 'graphql'
import { isScalar } from './utils'
import { createDocument } from 'graphql-tools/dist/stitching/delegateToSchema'


function extractTypeName(rootField: string): string {
  if (rootField.startsWith('all')) {
    return rootField.slice(3, -1)
  }

  return rootField.replace(/^(create|update|delete)/, '')
}

export function prepareInfoForQueryOrMutation(
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

export function prepareInfoForExistsQuery(
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

function extractDocumentAndVariableValues(
  operation: 'query' | 'mutation' | 'subscription',
  fieldName: string,
  args: { [key: string]: any },
  context: { [key: string]: any },
  info: GraphQLResolveInfo,
  remoteSchema: GraphQLSchema,
  fragmentReplacements: {
    [typeName: string]: {
      [fieldName: string]: InlineFragmentNode
    }
  },
): {
  document: DocumentNode
  variableValues?: any
} {
  let type
  if (operation === 'query') {
    type = remoteSchema.getQueryType()
  } else if (operation === 'mutation') {
    type = remoteSchema.getMutationType()
  } else if (operation === 'subscription') {
    type = remoteSchema.getSubscriptionType()
  }

  if (!type) {
    throw new TypeError('Could not forward to remote schema')
  }

  const document: DocumentNode = createDocument(
    remoteSchema,
    fragmentReplacements,
    type,
    fieldName,
    operation,
    info.fieldNodes,
    info.fragments,
    info.operation ? info.operation.variableDefinitions : [],
  )

  const operationDefinition = document.definitions.find(
    ({ kind }) => kind === Kind.OPERATION_DEFINITION,
  ) as OperationDefinitionNode
  let variableValues = {}
  if (operationDefinition && operationDefinition.variableDefinitions) {
    operationDefinition.variableDefinitions.forEach(definition => {
      const key = definition.variable.name.value
      // (XXX) This is kinda hacky
      let actualKey = key
      if (actualKey.startsWith('_')) {
        actualKey = actualKey.slice(1)
      }
      const value = args[actualKey] || args[key] || info.variableValues[key]
      variableValues[key] = value
    })
  }

  // override arguments
  if (operationDefinition) {
    // implement just for root level (mutations) for now
    operationDefinition.selectionSet.selections
      .filter(s => s.kind === Kind.FIELD && s.arguments)
      .forEach((field: FieldNode) => {
        field.arguments!.forEach(arg => {
          const newValue = args[arg.name.value]
          if (newValue === null) {
            arg.value = { kind: 'NullValue' }
          } else if (
            newValue !== undefined &&
            arg.value.kind !== 'Variable' &&
            arg.value.kind !== 'ObjectValue' &&
            arg.value.kind !== 'NullValue' &&
            arg.value.kind !== 'ListValue'
          ) {
            arg.value.value = newValue
          }
        })
      })
  }

  console.log(print(document), variableValues)

  return {
    document,
    variableValues,
  }
}
