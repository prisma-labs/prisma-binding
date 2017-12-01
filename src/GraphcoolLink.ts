import { HybridLink } from 'graphql-remote'

export class GraphcoolLink extends HybridLink {
  constructor(endpoint: string, apikey?: string) {
    const headers = apikey
      ? {
          Authorization: `Bearer ${apikey}`,
        }
      : {}
    const serviceId = endpoint.split('/').pop()
    super({
      http: {
        uri: endpoint,
        headers,
      },
      ws: {
        uri: `wss://subscriptions.graph.cool/v1/${serviceId}`,
        options: {
          params: headers,
        },
      },
    })
  }
}
