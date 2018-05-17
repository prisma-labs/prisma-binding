"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = require("ava");
var Prisma_1 = require("./Prisma");
var path_1 = require("path");
ava_1.default('multiple Prisma instances with unique schemas do not share schemas', function (t) {
    var prismaA = new Prisma_1.Prisma({
        typeDefs: path_1.join(__dirname, '../src/fixtures/testSchemaA.graphql'),
        endpoint: 'https://mock-prisma-endpoint.io/serviceA',
        secret: 'secretA',
    });
    var prismaB = new Prisma_1.Prisma({
        typeDefs: path_1.join(__dirname, '../src/fixtures/testSchemaB.graphql'),
        endpoint: 'https://mock-prisma-endpoint.io/serviceB',
        secret: 'secretB',
    });
    t.not(prismaA.schema, prismaB.schema);
});
ava_1.default('multiple Prisma instances with the same schema use a cached copy', function (t) {
    var options = {
        typeDefs: path_1.join(__dirname, '../src/fixtures/testSchemaA.graphql'),
        endpoint: 'https://mock-prisma-endpoint.io/serviceA',
        secret: 'secretA',
    };
    var prismaA = new Prisma_1.Prisma(options);
    var prismaB = new Prisma_1.Prisma(options);
    t.is(prismaA.schema, prismaB.schema);
});
//# sourceMappingURL=Prisma.test.js.map