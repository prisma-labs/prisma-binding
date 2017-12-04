import { FetchOptions, HttpLink } from 'apollo-link-http'
import * as fetch from 'cross-fetch'

export class GraphcoolLink extends HttpLink {
  constructor(endpoint: string, apikey?: string) {
    super({
      uri: endpoint,
      headers: apikey ? { Authorization: `Bearer ${apikey}` } : {},
      fetch,
    })
  }
}
