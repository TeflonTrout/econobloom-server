"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlantType = exports.MarketCondition = void 0;
// Using enums
var MarketCondition;
(function (MarketCondition) {
    MarketCondition["Fast"] = "fast";
    MarketCondition["Slow"] = "slow";
    MarketCondition["Stable"] = "stable";
})(MarketCondition || (exports.MarketCondition = MarketCondition = {}));
var PlantType;
(function (PlantType) {
    PlantType["Cactus"] = "Cactus";
    PlantType["Vine"] = "Vine";
    // add other plant types as needed
})(PlantType || (exports.PlantType = PlantType = {}));
