"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
function getExistsTypes(queryType) {
    var types = getTypesAndWhere(queryType);
    return types
        .map(function (_a) {
        var type = _a.type, where = _a.where;
        return "  " + type + ": (where?: " + where + ") => Promise<boolean>";
    })
        .join('\n');
}
exports.getExistsTypes = getExistsTypes;
function getExistsFlowTypes(queryType) {
    var types = getTypesAndWhere(queryType);
    return types.map(function (_a) {
        var type = _a.type, where = _a.where;
        return type + "(where?: " + where + "): Promise<boolean>;";
    })
        .join('\n');
}
exports.getExistsFlowTypes = getExistsFlowTypes;
function getTypesAndWhere(queryType) {
    var fields = queryType.getFields();
    var listFields = Object.keys(fields).reduce(function (acc, field) {
        var deepType = getDeepListType(fields[field]);
        if (deepType) {
            acc.push({ field: fields[field], deepType: deepType });
        }
        return acc;
    }, []);
    return listFields.map(function (_a) {
        var field = _a.field, deepType = _a.deepType;
        return ({
            type: deepType.name,
            pluralFieldName: field.name,
            where: getWhere(field),
        });
    });
}
exports.getTypesAndWhere = getTypesAndWhere;
function getWhere(field) {
    return field.args.find(function (a) { return a.name === 'where'; })
        .type.name;
}
exports.getWhere = getWhere;
function getDeepListType(field) {
    var type = field.type;
    if (graphql_1.isListType(type)) {
        return type.ofType;
    }
    if (graphql_1.isWrappingType(type) && graphql_1.isListType(type.ofType)) {
        return type.ofType.ofType;
    }
    return null;
}
exports.getDeepListType = getDeepListType;
//# sourceMappingURL=utils.js.map