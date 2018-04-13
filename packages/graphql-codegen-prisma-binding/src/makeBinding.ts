import {
  DocumentNode,
  Kind,
  ObjectTypeDefinitionNode,
  OperationTypeDefinitionNode,
  parse,
} from 'graphql'
import { GraphQLSchema } from 'graphql/type/schema'
import { buildASTSchema } from 'graphql/utilities/buildASTSchema'
import { generators } from './generators'
import { GeneratorType } from './types'
import { makeBinding as makeGraphQLBinding } from 'graphql-codegen-binding'

/**
 * The schema contains incompatible characters sometimes, e.g.
 * data types in comments are emphasized with "`", which represents
 * template strings in ES2015 and TypeScript. This function
 * replaces those characters with sane defaults.
 *
 * @param schema {String} The serialized schema
 * @returns {String}
 *
 */
const sanitizeSchema = (schema: string) => schema.replace(/\`/g, "'")

export function makeBinding(
  schema: string,
  generatorName: GeneratorType,
): string {
  return makeGraphQLBinding(schema, generators[generatorName])
}
