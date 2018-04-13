import { makeBinding } from '../makeBinding'
import * as fs from 'fs'

const schema = fs.readFileSync(__dirname + '/fixtures/schema.graphql', 'utf-8')
test('typescript generator', () => {
  expect(makeBinding(schema, 'typescript')).toMatchSnapshot()
})
