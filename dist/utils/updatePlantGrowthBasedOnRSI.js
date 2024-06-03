"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlantGrowthBasedOnRSI = void 0;
const plant_1 = require("../types/plant");
function updatePlantGrowthBasedOnRSI(supabase, contract, MARKET_CONDITION_UUID) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Updating Plant Growth...');
        try {
            const txResponse = yield contract.requestMarketData();
            // Transaction is sent, you can log the hash right away
            console.log(`Transaction hash: ${txResponse.hash}`);
            // Wait for the transaction to be confirmed
            const txReceipt = yield txResponse.wait();
            console.log(`Transaction receipt: ${txReceipt}`);
            // Get the current RSI from the smart contract
            const rsiValue = yield contract.getRSI();
            console.log("The RSI value is:", rsiValue.toString());
            // Define growth conditions based on RSI
            const growthCondition = rsiValue > 60 ? plant_1.MarketCondition.Fast : rsiValue < 40 ? plant_1.MarketCondition.Slow : plant_1.MarketCondition.Stable;
            console.log("Current Growth Conditions : ", growthCondition);
            // Update market_conditions in Supabase
            const { data, error: supabaseError } = yield supabase
                .from('market_conditions')
                .update({ current_condition: growthCondition })
                .eq('id', MARKET_CONDITION_UUID)
                .select("*"); // RETURN THE UPDATED ROW
            if (supabaseError) {
                console.error('Error updating Supabase:', supabaseError);
            }
            else {
                console.log('Updated plant growth conditions:', data);
            }
        }
        catch (error) {
            console.error("Error updating RSI: ", error);
        }
    });
}
exports.updatePlantGrowthBasedOnRSI = updatePlantGrowthBasedOnRSI;
