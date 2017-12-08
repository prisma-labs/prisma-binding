import { InlineFragmentNode, parse, Kind } from 'graphql'
import { IResolvers } from 'graphql-tools/dist/Interfaces'

export interface FragmentReplacements {
  [typeName: string]: {
    [fieldName: string]: InlineFragmentNode
  }
}

export function extractFragmentReplacements(
  resolvers: IResolvers,
): FragmentReplacements {
  const fragmentReplacements: FragmentReplacements = {}

  for (const typeName in resolvers) {
    const fieldResolvers = resolvers[typeName]
    for (const fieldName in fieldResolvers) {
      const fieldResolver = fieldResolvers[fieldName]
      if (typeof fieldResolver === 'object' && 'fragment' in fieldResolver) {

        // parse & set fragment
        const fragment = parseFragmentToInlineFragment(fieldResolver.fragment)
        const remoteTypeName = fragment.typeCondition!.name.value

        // lazy init type level for fragmentReplacements
        fragmentReplacements[remoteTypeName] = fragmentReplacements[typeName] || {}
        fragmentReplacements[remoteTypeName][fieldName] = fragment
      }
    }
  }

  return fragmentReplacements
}

function parseFragmentToInlineFragment(
  definitions: string,
): InlineFragmentNode {
  const document = parse(definitions)
  for (const definition of document.definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      return {
        kind: Kind.INLINE_FRAGMENT,
        typeCondition: definition.typeCondition,
        selectionSet: definition.selectionSet,
      }
    }
  }
  throw new Error('Could not parse fragment')
}
