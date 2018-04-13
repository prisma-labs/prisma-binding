# graphql-codegen-binding

## Usage

### CLI

```sh
$ npm install -g graphql-codegen-binding
$ graphql-codegen-binding

Usage: graphql-codegen-binding -s [schema] -e [endpoint] -h [headers] -g [generator] -t [target]

Options:
  --help           Show help                                           [boolean]
  --version        Show version number                                 [boolean]
  --schema, -s     Path to schema.graphql file                          [string]
  --endpoint, -e   GraphQL endpoint to fetch schema from                [string]
  --headers, -h    Header to use for downloading the schema (with endpoint URL)
                                                                        [string]
  --generator, -g  Type of the generator. Available generators: typescript,
                   javascript                                [string] [required]
  --target, -t     Target file. Example: schema.ts           [string] [required]
```

### Typescript

```ts
import { generateCode } from 'graphql-codegen-binding'
import * as fs from 'fs'

const code = generateCode(fs.readFileSync('schema.graphql'), 'typescript')

fs.writeFileSync('MyBinding.ts', code)
```
