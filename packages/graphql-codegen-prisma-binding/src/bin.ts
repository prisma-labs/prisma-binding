#!/usr/bin/env node

import * as yargs from 'yargs'
import { generateCode } from '.'

const argv = yargs
  .usage(
    `Usage: $0 -s [schema] -e [endpoint] -h [headers] -g [generator] -t [target]`,
  )
  .options({
    schema: {
      alias: 's',
      describe: 'Path to schema.graphql file',
      type: 'string',
    },
    endpoint: {
      alias: 'e',
      describe: 'GraphQL endpoint to fetch schema from',
      type: 'string',
    },
    headers: {
      alias: 'h',
      describe: 'Header to use for downloading the schema (with endpoint URL)',
      type: 'string',
    },
    generator: {
      alias: 'g',
      describe:
        'Type of the generator. Available generators: typescript, javascript',
      type: 'string',
    },
    target: {
      alias: 't',
      describe: 'Target file. Example: schema.ts',
      type: 'string',
    },
  })
  .demandOption(['g', 't']).argv

run(argv)

async function run(argv) {
  const endpointHeaders = {}
  const headers = argv.headers
    ? Array.isArray(argv.headers) ? argv.headers : [argv.headers]
    : undefined
  if (headers) {
    Object.assign(
      endpointHeaders,
      ...headers.map(h => ({ [h.split('=')[0]]: h.split('=')[1] })),
    )
  }

  const { generator, target, endpoint } = argv
  await generateCode({
    schemaPath: argv.schema,
    generator,
    target,
    endpoint,
    headers: endpointHeaders,
  })

  console.log('Done generating binding')
}
