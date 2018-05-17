"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Prisma_1 = require("./Prisma");
exports.Prisma = Prisma_1.Prisma;
var link_1 = require("./link");
exports.makePrismaLink = link_1.makePrismaLink;
var graphql_binding_1 = require("graphql-binding");
exports.extractFragmentReplacements = graphql_binding_1.extractFragmentReplacements;
exports.forwardTo = graphql_binding_1.forwardTo;
var makePrismaBindingClass_1 = require("./makePrismaBindingClass");
exports.makePrismaBindingClass = makePrismaBindingClass_1.makePrismaBindingClass;
//# sourceMappingURL=index.js.map