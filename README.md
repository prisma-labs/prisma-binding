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

#### `constructor(options: GraphcoolOptions): Graphcool`

The `options` object accepts the following fields:

| Key | Required |  Type | Default | Note |
| ---  | --- | --- | --- | --- |
| `schemaPath` | Yes | `string` |  - | File path to the schema definition of your Graphcool service (typically a file called `database.graphql`) |
| `endpoint` | Yes | `string` |  - | The endpoint of your Graphcool service |
| `secret` | Yes | `string` |  - | The secret of your Graphcool service |
| `fragmentReplacements` | No | `FragmentReplacements` |  `null` | See below |


## Usage

See [graphql-boilerplate](https://github.com/graphcool/graphql-boilerplate).
