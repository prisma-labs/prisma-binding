# graphcool-binding

GraphQL Binding for Graphcool services (GraphQL Database)

## Overview

`graphcool-binding` provides a convenience layer for building GraphQL servers on top of Graphcool services.

Here is how it works:

1. Create your Graphcool service by defining data model
1. Download generated database schema `database.graphql` (full CRUD API)
1. Define your application schema, typically called `app.graphql`
1. Implement resolvers for application schema by delegating to underlying Graphcool service using `graphcool-binding`

## Install

```sh
yarn add graphcool-binding
```

## Usage

See [graphql-boilerplate](https://github.com/graphcool/graphql-boilerplate).
