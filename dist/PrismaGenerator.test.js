"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var graphql_1 = require("graphql");
var PrismaGenerator_1 = require("./PrismaGenerator");
var ava_1 = require("ava");
var typeDefs = fs.readFileSync(path.join(__dirname, '../src/fixtures/schema.graphql'), 'utf-8');
ava_1.test('basic generator', function (t) {
    var schema = graphql_1.buildSchema(typeDefs);
    var generator = new PrismaGenerator_1.PrismaGenerator({
        schema: schema,
        inputSchemaPath: 'src/schema.js',
        outputBindingPath: 'src/generated/binding.js',
    });
    var result = generator.render();
    t.snapshot(result);
});
//# sourceMappingURL=PrismaGenerator.test.js.map