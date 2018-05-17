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
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_link_1 = require("apollo-link");
var SharedLink = /** @class */ (function (_super) {
    __extends(SharedLink, _super);
    function SharedLink() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SharedLink.prototype.setInnerLink = function (innerLink) {
        this.innerLink = innerLink;
    };
    SharedLink.prototype.request = function (operation, forward) {
        if (!this.innerLink) {
            throw new Error('No inner link set');
        }
        return this.innerLink.request(operation, forward);
    };
    return SharedLink;
}(apollo_link_1.ApolloLink));
exports.SharedLink = SharedLink;
//# sourceMappingURL=SharedLink.js.map