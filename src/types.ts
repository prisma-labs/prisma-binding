import { FragmentReplacements } from 'graphql-binding';

export interface Exists {
  [rootField: string]: (filter: { [key: string]: any }) => Promise<boolean>
}

export interface GraphcoolOptions extends BaseGraphcoolOptions {
  schemaPath?: string,
  typeDefs?: string
}

export interface BaseGraphcoolOptions {
  fragmentReplacements?: FragmentReplacements
  endpoint: string
  secret: string
  debug?: boolean
}
