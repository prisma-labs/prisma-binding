"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_binding_1 = require("graphql-binding");
var graphql_1 = require("graphql");
var utils_1 = require("./utils");
var PrismaTypescriptGenerator = /** @class */ (function (_super) {
    __extends(PrismaTypescriptGenerator, _super);
    function PrismaTypescriptGenerator(options) {
        return _super.call(this, options) || this;
    }
    PrismaTypescriptGenerator.prototype.render = function () {
        return this.compile(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", "\n\nexport interface Query ", "\n\nexport interface Mutation ", "\n\nexport interface Subscription ", "\n\nexport interface Exists ", "\n\nexport interface Prisma {\n  query: Query\n  mutation: Mutation\n  subscription: Subscription\n  exists: Exists\n  request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>\n  delegate(operation: 'query' | 'mutation', fieldName: string, args: {\n    [key: string]: any;\n}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<any>;\ndelegateSubscription(fieldName: string, args?: {\n    [key: string]: any;\n}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<AsyncIterator<any>>;\ngetAbstractResolvers(filterSchema?: GraphQLSchema | string): IResolvers;\n}\n\nexport interface BindingConstructor<T> {\n  new(options: BasePrismaOptions): T\n}\n/**\n * Type Defs\n*/\n\n", "\n\n", "\n\n/**\n * Types\n*/\n\n", ""], ["\\\n", "\n\nexport interface Query ", "\n\nexport interface Mutation ", "\n\nexport interface Subscription ", "\n\nexport interface Exists ", "\n\nexport interface Prisma {\n  query: Query\n  mutation: Mutation\n  subscription: Subscription\n  exists: Exists\n  request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>\n  delegate(operation: 'query' | 'mutation', fieldName: string, args: {\n    [key: string]: any;\n}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<any>;\ndelegateSubscription(fieldName: string, args?: {\n    [key: string]: any;\n}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<AsyncIterator<any>>;\ngetAbstractResolvers(filterSchema?: GraphQLSchema | string): IResolvers;\n}\n\nexport interface BindingConstructor<T> {\n  new(options: BasePrismaOptions): T\n}\n/**\n * Type Defs\n*/\n\n", "\n\n", "\n\n/**\n * Types\n*/\n\n", ""])), this.renderImports(), this.renderQueries(), this.renderMutations(), this.renderSubscriptions(), this.renderExists(), this.renderTypedefs(), this.renderExports(), this.renderTypes());
    };
    PrismaTypescriptGenerator.prototype.renderImports = function () {
        return "import { GraphQLResolveInfo, GraphQLSchema } from 'graphql'\nimport { IResolvers } from 'graphql-tools/dist/Interfaces'\nimport { Options } from 'graphql-binding'\nimport { makePrismaBindingClass, BasePrismaOptions } from 'prisma-binding'";
    };
    PrismaTypescriptGenerator.prototype.renderExports = function () {
        return "export const Prisma = makePrismaBindingClass<BindingConstructor<Prisma>>({typeDefs})";
    };
    PrismaTypescriptGenerator.prototype.renderTypedefs = function () {
        return ('const typeDefs = `' + graphql_1.printSchema(this.schema).replace(/`/g, '\\`') + '`');
    };
    PrismaTypescriptGenerator.prototype.renderExists = function () {
        var queryType = this.schema.getQueryType();
        if (queryType) {
            return "{\n" + utils_1.getExistsTypes(queryType) + "\n}";
        }
        return '{}';
    };
    return PrismaTypescriptGenerator;
}(graphql_binding_1.TypescriptGenerator));
exports.PrismaTypescriptGenerator = PrismaTypescriptGenerator;
var templateObject_1;
//# sourceMappingURL=PrismaTypescriptGenerator.js.map