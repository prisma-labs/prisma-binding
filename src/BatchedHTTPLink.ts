import { ApolloLink, Observable, Operation } from 'apollo-link'
import { BatchedGraphQLClient } from 'batched-graphql-request'
import { HttpOptions } from './types'
import { print } from 'graphql'

export class BatchedHttpLink extends ApolloLink {
  constructor(options: HttpOptions) {
    super(BatchedHttpLink.createBatchedHttpRequest(options))
  }

  private static createBatchedHttpRequest(options: HttpOptions) {
    const { uri, ...rest } = options
    const client = new BatchedGraphQLClient(uri, rest)

    return (operation: Operation) =>
      new Observable(observer => {
        const {
          headers,
          uri: contextURI,
        }: Record<string, any> = operation.getContext()

        const { operationName, variables, query } = operation

        if (contextURI) {
          client.url = contextURI
        }

        if (headers) {
          client.options = {
            ...client.options,
            headers: {
              ...client.options.headers,
              ...headers,
            },
          }
        }

        client
          .request(print(query), variables, operationName)
          .then(response => {
            operation.setContext({ response })
            observer.next({ data: response })
            observer.complete()
            return response
          })
          .catch(err => {
            if (err.name === 'AbortError') {
              return
            }

            observer.error(err)
          })
      })
  }
}
