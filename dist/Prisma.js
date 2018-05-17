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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_binding_1 = require("graphql-binding");
var jsonwebtoken_1 = require("jsonwebtoken");
var link_1 = require("./link");
var info_1 = require("./info");
var SharedLink_1 = require("./SharedLink");
var utils_1 = require("./utils");
var cache_1 = require("./cache");
var sharedLink = new SharedLink_1.SharedLink();
var Prisma = /** @class */ (function (_super) {
    __extends(Prisma, _super);
    function Prisma(_a) {
        var typeDefs = _a.typeDefs, endpoint = _a.endpoint, secret = _a.secret, fragmentReplacements = _a.fragmentReplacements, debug = _a.debug;
        var _this = this;
        if (!typeDefs) {
            throw new Error('No `typeDefs` provided when calling `new Prisma()`');
        }
        if (typeDefs.endsWith('.graphql')) {
            typeDefs = cache_1.getCachedTypeDefs(typeDefs);
        }
        if (endpoint === undefined) {
            throw new Error("No Prisma endpoint found. Please provide the `endpoint` constructor option.");
        }
        if (!endpoint.startsWith('http')) {
            throw new Error("Invalid Prisma endpoint provided: " + endpoint);
        }
        fragmentReplacements = fragmentReplacements || [];
        debug = debug || false;
        var token = secret ? jsonwebtoken_1.sign({}, secret) : undefined;
        var link = link_1.makePrismaLink({ endpoint: endpoint, token: token, debug: debug });
        var remoteSchema = cache_1.getCachedRemoteSchema(typeDefs, sharedLink);
        var before = function () {
            sharedLink.setInnerLink(link);
        };
        _this = _super.call(this, {
            schema: remoteSchema,
            fragmentReplacements: fragmentReplacements,
            before: before,
        }) || this;
        _this.exists = _this.buildExists();
        return _this;
    }
    Prisma.prototype.buildExists = function () {
        var _this = this;
        var queryType = this.schema.getQueryType();
        if (!queryType) {
            return {};
        }
        if (queryType) {
            var types = utils_1.getTypesAndWhere(queryType);
            return types.reduce(function (acc, _a) {
                var type = _a.type, pluralFieldName = _a.pluralFieldName;
                return __assign({}, acc, (_b = {}, _b[type] = function (args) {
                    return _this.delegate('query', pluralFieldName, { where: args }, info_1.buildExistsInfo(pluralFieldName, _this.schema)).then(function (res) { return res.length > 0; });
                }, _b));
                var _b;
            }, {});
        }
        return {};
    };
    return Prisma;
}(graphql_binding_1.Binding));
exports.Prisma = Prisma;
//# sourceMappingURL=Prisma.js.map