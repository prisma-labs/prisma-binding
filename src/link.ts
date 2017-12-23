import { createHttpLink } from 'apollo-link-http'
import * as fetch from 'cross-fetch'
import { print } from 'graphql'
import { ApolloLink } from 'apollo-link'

export function makeGraphcoolLink({
  endpoint,
  token,
  debug,
}: {
  endpoint: string
  token: string
  debug: boolean
}): ApolloLink {
  const httpLink = createHttpLink({
    uri: endpoint,
    headers: { Authorization: `Bearer ${token}` },
    fetch,
  })

  const reportErrors = new ApolloLink((operation, forward) => {
    const observer = forward!(operation)
    observer.subscribe({
      error: err => {
        console.log(err)

        // unfortunately throwing errors in links doesn't work yet
        // current workaround: console log

        // throw err
      },
    })
    return observer
  })

  if (debug) {
    const debugLink = new ApolloLink((operation, forward) => {
      console.log(`Request to ${endpoint}:`)
      console.log(`query:`)
      console.log(print(operation.query).trim())
      console.log(`operationName: ${operation.operationName}`)
      console.log(`variables:`)
      console.log(JSON.stringify(operation.variables, null, 2))

      return forward!(operation).map(data => {
        console.log(`Response from ${endpoint}:`)
        console.log(JSON.stringify(data.data, null, 2))
        return data
      })
    })

    return ApolloLink.from([debugLink, reportErrors, httpLink])
  } else {
    return ApolloLink.from([reportErrors, httpLink])
  }
}
