"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var apollo_link_1 = require("apollo-link");
var apollo_link_ws_1 = require("apollo-link-ws");
var apollo_link_error_1 = require("apollo-link-error");
var ws = require("ws");
var http_link_dataloader_1 = require("http-link-dataloader");
function makePrismaLink(_a) {
    var endpoint = _a.endpoint, token = _a.token, debug = _a.debug;
    var httpLink = new http_link_dataloader_1.HTTPLinkDataloader({
        uri: endpoint,
        headers: token ? { Authorization: "Bearer " + token } : {},
    });
    // also works for https/wss
    var wsEndpoint = endpoint.replace(/^http/, 'ws');
    var wsLink = new apollo_link_ws_1.WebSocketLink({
        uri: wsEndpoint,
        options: {
            reconnect: true,
            connectionParams: token
                ? {
                    Authorization: "Bearer " + token,
                }
                : {},
            lazy: true,
            inactivityTimeout: 30000,
        },
        webSocketImpl: ws,
    });
    // TODO fix link typings
    var backendLink = apollo_link_1.split(function (op) { return isSubscription(op); }, wsLink, httpLink);
    var reportErrors = apollo_link_error_1.onError(function (_a) {
        var graphQLErrors = _a.graphQLErrors, networkError = _a.networkError;
        if (graphQLErrors)
            graphQLErrors.map(function (_a) {
                var message = _a.message, locations = _a.locations, path = _a.path;
                return console.log("[GraphQL error]: Message: " + message + ", Location: " + locations + ", Path: " + path);
            });
        if (networkError)
            console.log("[Network error]: " + networkError);
    });
    if (debug) {
        var debugLink = new apollo_link_1.ApolloLink(function (operation, forward) {
            console.log("Request to " + endpoint + ":");
            console.log("query:");
            console.log(graphql_1.print(operation.query).trim());
            console.log("operationName: " + operation.operationName);
            console.log("variables:");
            console.log(JSON.stringify(operation.variables, null, 2));
            return forward(operation).map(function (data) {
                console.log("Response from " + endpoint + ":");
                console.log(JSON.stringify(data.data, null, 2));
                return data;
            });
        });
        return apollo_link_1.ApolloLink.from([debugLink, reportErrors, backendLink]);
    }
    else {
        return apollo_link_1.ApolloLink.from([reportErrors, backendLink]);
    }
}
exports.makePrismaLink = makePrismaLink;
function isSubscription(operation) {
    var selectedOperation = getSelectedOperation(operation);
    if (selectedOperation) {
        return selectedOperation.operation === 'subscription';
    }
    return false;
}
function getSelectedOperation(operation) {
    if (operation.query.definitions.length === 1) {
        return operation.query.definitions[0];
    }
    return operation.query.definitions.find(function (d) {
        return d.kind === 'OperationDefinition' &&
            !!d.name &&
            d.name.value === operation.operationName;
    });
}
//# sourceMappingURL=link.js.map