import {
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLList,
} from 'graphql'

export function isScalar(t: GraphQLOutputType): boolean {
  if (t instanceof GraphQLScalarType || t instanceof GraphQLEnumType) {
    return true
  }

  if (
    t instanceof GraphQLObjectType ||
    t instanceof GraphQLInterfaceType ||
    t instanceof GraphQLUnionType ||
    t instanceof GraphQLList
  ) {
    return false
  }

  const nnt = t as GraphQLOutputType
  if (nnt instanceof GraphQLNonNull) {
    if (
      nnt.ofType instanceof GraphQLScalarType ||
      nnt.ofType instanceof GraphQLEnumType
    ) {
      return true
    }
  }

  return false
}

export function extractTypeNameFromRootField(rootField: string): string {
  if (rootField.startsWith('all')) {
    return rootField.slice(3, -1)
  }

  return rootField.replace(/^(create|update|delete)/, '')
}
