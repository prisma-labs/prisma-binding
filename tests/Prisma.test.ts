import test from 'ava'
import { Prisma } from '../src/Prisma'
import { resolve } from 'path'

test('multiple Prisma instances with unique schemas do not share schemas', (t) => {
  const prismaA = new Prisma({
    typeDefs: resolve(__dirname, 'fixtures/testSchemaA.graphql'),
    endpoint: 'https://mock-prisma-endpoint.io/serviceA',
    secret: 'secretA',
  })

  const prismaB = new Prisma({
    typeDefs: resolve(__dirname, 'fixtures/testSchemaB.graphql'),
    endpoint: 'https://mock-prisma-endpoint.io/serviceB',
    secret: 'secretB',
  })

  t.not(prismaA.schema, prismaB.schema)
})

test('multiple Prisma instances with the same schema use a cached copy', (t) => {
  const options = {
    typeDefs: resolve(__dirname, 'fixtures/testSchemaA.graphql'),
    endpoint: 'https://mock-prisma-endpoint.io/serviceA',
    secret: 'secretA',
  }

  const prismaA = new Prisma(options)
  const prismaB = new Prisma(options)

  t.is(prismaA.schema, prismaB.schema)
})
