import {
  GraphQLObjectType,
  isWrappingType,
  isListType,
  GraphQLInputObjectType,
} from 'graphql'

export function getExistsTypes(queryType: GraphQLObjectType) {
  const types = getTypesAndWhere(queryType)
  return types
    .map(
      ({ type, where }) => `  ${type}: (where?: ${where}) => Promise<boolean>`,
    )
    .join('\n')
}

export function getExistsFlowTypes(queryType: GraphQLObjectType) {
  const types = getTypesAndWhere(queryType)
  return types
    .map(({ type, where }) => `${type}(where?: ${where}): Promise<boolean>;`)
    .join('\n')
}

export function getTypesAndWhere(queryType: GraphQLObjectType) {
  const fields = queryType.getFields()
  const listFields = Object.keys(fields).reduce(
    (acc, field) => {
      const deepType = getDeepListType(fields[field])
      if (deepType) {
        acc.push({ field: fields[field], deepType })
      }
      return acc
    },
    [] as any[],
  )

  return listFields.map(({ field, deepType }) => ({
    type: deepType.name,
    pluralFieldName: field.name,
    where: getWhere(field),
  }))
}

export function getWhere(field) {
  return (field.args.find(a => a.name === 'where')!
    .type as GraphQLInputObjectType).name
}

export function getDeepListType(field) {
  const type = field.type
  if (isListType(type)) {
    return type.ofType
  }

  if (isWrappingType(type) && isListType(type.ofType)) {
    return type.ofType.ofType
  }

  return null
}
