# graphcool-binding

GraphQL Binding for Graphcool services (GraphQL Database)

## Overview

`graphcool-binding` provides a convenience layer for building GraphQL servers on top of Graphcool services. In short, it simplifies implementing your GraphQL resolvers by _delegating_ execution of queries (or mutations)  to the API of the underlying Graphcool database service.

Here is how it works:

1. Create your Graphcool service by defining data model
1. Download generated database schema `database.graphql` (full CRUD API)
1. Define your application schema, typically called `app.graphql`
1. Implement resolvers for application schema by delegating to underlying Graphcool service using `graphcool-binding`

## Install

```sh
yarn add graphcool-binding
```

## API

### `Graphcool`

Instances of `Graphcool` allow you to interact with your Graphcool service, this includes:

- delegating execution of queries and mutations to the Graphcool service (using the `query` and `mutation` properties)
- checking if a certain node exists in the Graphcool database (using the `exists` property)
- sending queries and mutations to the Graphcool service (using the `request` method)

#### `constructor(options: GraphcoolOptions): Graphcool`

The `GraphcoolOptions` type has the following fields:

| Key | Required |  Type | Default | Note |
| ---  | --- | --- | --- | --- |
| `schemaPath` | Yes | `string` |  - | File path to the schema definition of your Graphcool service (typically a file called `database.graphql`) |
| `endpoint` | Yes | `string` |  - | The endpoint of your Graphcool service |
| `secret` | Yes | `string` |  - | The secret of your Graphcool service |
| `fragmentReplacements` | No | `FragmentReplacements` |  `null` | See below |

#### `query` and `mutation`

##### Idea

`query` and `mutation` are public properties on your `Graphcool` instance. They both are of type `Query` and expose a number of functions that are named after the fields on the `Query` and `Mutation` types in your Graphcool database schema.

Each of these functions is a convenience API for you to send a query/mutation to the Graphcool service, so you don't have to write out the full query/mutation from scratch.

The functions have the following API:

```js
(args: any, info: GraphQLResolveInfo | string): Promise<T>
```

The input arguments are used as follows:

- `args`: An object that carries potential arguments for the query/mutation
- `info`: Represents the selection set of the query/mutation

##### Example

Consider the following data model for your Graphcool service:

```graphql
type User {
  id: ID! @unique
  name: String
}
```

When deploying the service, Graphcool will generate a database schema similar to this:

```graphql
type Query {
  user(id: ID!): User
  users: [User!]!
}

type Mutation {
  createUser(name: String!): User
  updateUser(id: ID!, name: String): User
  deleteUser(id: ID!): User
}
```

> Note: This is a simplified version of the schema that's actually generated

If you instantiate `Graphcool` based on this service, you'll be able to send the following queries/mutations:

```js
// Instantiate `Graphcool` based on concrete service
const graphcool = Graphcool({ ... })

// Retrieve `name` of a specific user
graphcool.user({ id: 'abc' }, `{ name }`)

// Retrieve `id` and `name` of all users
graphcool.users(null, `{ id name }`)

// Create new user called `Sarah` and retrieve the `id`
graphcool.createUser({ name: 'Sarah' }, `{ id }`)

// Update name of a specific user and retrieve the `id`
graphcool.updateUser({ id: 'abc', name: 'Sarah' }, `{ id }`)

// Delete a specific user and retrieve the `name`
graphcool.deleteUser({ id: 'abc' }, `{ id }`)
```


#### `exists`

## Usage

See [graphql-boilerplate](https://github.com/graphcool/graphql-boilerplate).
