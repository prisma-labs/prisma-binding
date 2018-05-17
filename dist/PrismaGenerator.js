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
var PrismaGenerator = /** @class */ (function (_super) {
    __extends(PrismaGenerator, _super);
    function PrismaGenerator(options) {
        return _super.call(this, options) || this;
    }
    PrismaGenerator.prototype.render = function () {
        return this.compile(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", "\n\n\n/**\n * Type Defs\n*/\n\n", "\n\n", "\n"], ["\\\n", "\n\n\n/**\n * Type Defs\n*/\n\n", "\n\n", "\n"])), this.renderImports(), this.renderTypedefs(), this.renderExports());
    };
    PrismaGenerator.prototype.renderImports = function () {
        return "const { makePrismaBindingClass } = require('prisma-binding')";
    };
    PrismaGenerator.prototype.renderExports = function () {
        return "const Prisma = makePrismaBindingClass({ typeDefs })\nmodule.exports = { Prisma }";
    };
    PrismaGenerator.prototype.renderTypedefs = function () {
        return ('const typeDefs = `' + graphql_1.printSchema(this.schema).replace(/`/g, '\\`') + '`');
    };
    return PrismaGenerator;
}(graphql_binding_1.Generator));
exports.PrismaGenerator = PrismaGenerator;
var templateObject_1;
//# sourceMappingURL=PrismaGenerator.js.map