import { FetchOptions, HttpLink } from 'apollo-link-http'
import * as fetch from 'cross-fetch'

export class GraphcoolLink extends HttpLink {
  constructor(endpoint: string, token: string) {
    super({
      uri: endpoint,
      headers: { Authorization: `Bearer ${token}` },
      fetch,
    })
  }
}
