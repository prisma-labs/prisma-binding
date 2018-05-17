"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_import_1 = require("graphql-import");
var graphql_tools_1 = require("graphql-tools");
var typeDefsCache = {};
var remoteSchemaCache = {};
function getCachedTypeDefs(schemaPath) {
    if (typeDefsCache[schemaPath]) {
        return typeDefsCache[schemaPath];
    }
    var schema = graphql_import_1.importSchema(schemaPath);
    typeDefsCache[schemaPath] = schema;
    return schema;
}
exports.getCachedTypeDefs = getCachedTypeDefs;
function getCachedRemoteSchema(typeDefs, link) {
    if (remoteSchemaCache[typeDefs]) {
        return remoteSchemaCache[typeDefs];
    }
    var remoteSchema = graphql_tools_1.makeRemoteExecutableSchema({
        // TODO fix typings
        link: link,
        schema: typeDefs,
    });
    remoteSchemaCache[typeDefs] = remoteSchema;
    return remoteSchema;
}
exports.getCachedRemoteSchema = getCachedRemoteSchema;
//# sourceMappingURL=cache.js.map