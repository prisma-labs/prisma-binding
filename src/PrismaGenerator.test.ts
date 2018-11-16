import * as fs from 'fs'
import * as path from 'path'
import { buildSchema } from 'graphql'
import { PrismaGenerator } from './PrismaGenerator'
import test from 'ava'

const typeDefs = fs.readFileSync(
  path.join(__dirname, '../src/fixtures/schema.graphql'),
  'utf-8',
)
test('basic generator', t => {
  const schema = buildSchema(typeDefs)
  const generator = new PrismaGenerator({
    schema,
    inputSchemaPath: 'src/schema.js',
    outputBindingPath: 'src/generated/binding.js',
  })
  const result = generator.render()
  t.snapshot(result)
})
