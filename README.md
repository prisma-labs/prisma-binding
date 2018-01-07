# graphcool-binding

[![CircleCI](https://circleci.com/gh/graphcool/graphcool-binding.svg?style=shield)](https://circleci.com/gh/graphcool/graphcool-binding) [![npm version](https://badge.fury.io/js/graphcool-binding.svg)](https://badge.fury.io/js/graphcool-binding)

GraphQL Binding for Graphcool services (GraphQL Database)

## Overview

`graphcool-binding` provides a convenience layer for building GraphQL servers on top of Graphcool services. In short, it simplifies implementing your GraphQL resolvers by _delegating_ execution of queries (or mutations) to the API of the underlying Graphcool database service.

Here is how it works:

1. Create your Graphcool service by defining data model
1. Download generated database schema definition `database.graphql` (contains the full CRUD API)
1. Define your application schema, typically called `app.graphql`
1. Instantiate `Graphcool` with information about your Graphcool service (such as its endpoint and the path to the database schema definition)
1. Implement the resolvers for your application schema by delegating to the underlying Graphcool service using the generated delegate resolver functions

## Install

```sh
yarn add graphcool-binding
# or
npm install --save graphcool-binding
```

## Example

Consider the following data model for your Graphcool service:

```graphql
type User {
  id: ID! @unique
  name: String
}
```

If you instantiate `Graphcool` based on this service, you'll be able to send the following queries/mutations:

```js
// Instantiate `Graphcool` based on concrete service
const graphcool = new Graphcool({
  schemaPath: 'schemas/database.graphql',
  endpoint: 'https://api.graph.cool/simple/v1/my-graphcool-service'
  secret: 'my-super-secret-secret'
})

// Retrieve `name` of a specific user
graphcool.query.user({ where { id: 'abc' } }, '{ name }')

// Retrieve `id` and `name` of all users
graphcool.query.users(null, '{ id name }')

// Create new user called `Sarah` and retrieve the `id`
graphcool.mutation.createUser({ data: { name: 'Sarah' } }, '{ id }')

// Update name of a specific user and retrieve the `id`
graphcool.mutation.updateUser({ where: { id: 'abc' }, data: { name: 'Sarah' } }, '{ id }')

// Delete a specific user and retrieve the `name`
graphcool.mutation.deleteUser({ where: { id: 'abc' } }, '{ id }')
```

Under the hood, each of these function calls is simply translated into an actual HTTP request against your Graphcool service (using [`graphql-request`](https://github.com/graphcool/graphql-request)).

The API also allows to ask whether a specific node exists in your Graphcool database:

```js
// Ask whether a post exists with `id` equal to `abc` and whose
// `author` is called `Sarah` (return boolean value)
graphcool.exists.Post({
  id: 'abc',
  author: {
    name: 'Sarah'
  }
})
```

## API

### `constructor(options: GraphcoolOptions): Graphcool`

The `GraphcoolOptions` type has the following fields:

| Key | Required |  Type | Default | Note |
| ---  | --- | --- | --- | --- |
| `schemaPath` | Yes | `string` |  - | File path to the schema definition of your Graphcool service (typically a file called `database.graphql`) |
| `endpoint` | Yes | `string` |  - | The endpoint of your Graphcool service |
| `secret` | Yes | `string` |  - | The secret of your Graphcool service |
| `fragmentReplacements` | No | `FragmentReplacements` |  `null` | A list of GraphQL fragment definitions, specifying fields that are required for the resolver to function correctly |
| `debug` | No | `boolean` |  `false` | Log all queries/mutations to the console |

### `query` and `mutation`

`query` and `mutation` are public properties on your `Graphcool` instance. They both are of type `Query` and expose a number of auto-generated delegate resolver functions that are named after the fields on the `Query` and `Mutation` types in your Graphcool database schema.

Each of these delegate resolvers in essence provides a convenience API for sending queries/mutations to your Graphcool service, so you don't have to spell out the full query/mutation from scratch and worry about sending it over HTTP. This is all handled by the delegate resolver function under the hood.

Delegate resolver have the following interface:

```js
(args: any, info: GraphQLResolveInfo | string): Promise<T>
```

The input arguments are used as follows:

- `args`: An object carrying potential arguments for the query/mutation
- `info`: An object representing the selection set of the query/mutation, either expressed directly as a string or in the form of `GraphQLResolveInfo` (you can find more info about the `GraphQLResolveInfo` type [here](http://graphql.org/graphql-js/type/#graphqlobjecttype))

The generic type `T` corresponds to the type of the respective field. 

### `exists`

`exists` also is a public property on your `Graphcool` instance. Similar to `query` and `mutation`, it also exposes a number of auto-generated functions. However, it exposes only a single function per type. This function is named according to the root field that allows the retrieval of a single node of that type (e.g. `User` for a type called `User`). It takes a `where` object as an input argument and returns a `boolean` value indicating whether the condition expressed with `where` is met.

This function enables you to easily check whether a node of a specific type exists in your Graphcool database.

### `request`

The `request` method lets you send GraphQL queries/mutations to your Graphcool service. The functionality is identical to the auto-generated delegate resolves, but the API is more verbose as you need to spell out the full query/mutation. `request` uses [`graphql-request`](https://github.com/graphcool/graphql-request) under the hood.

Here is an example of how it can be used:

```js
const query = `
  query ($userId: ID!){
    user(id: $userId) {
      id
      name
    }
  }
`

const variables = { userId: 'abc' }

graphcool.request(query, variables)
  .then(result => console.log(result))
// sample result:
// {"data": { "user": { "id": "abc", "name": "Sarah" } } }
```

## Usage

- [graphql-boilerplate](https://github.com/graphcool/graphql-boilerplate).
- [graphql-server-example](https://github.com/graphcool/graphql-server-example).

## Next steps

- Code generation at build-time for the auto-generated delegate resolvers
