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
exports.waterPlant = void 0;
const ethers_1 = require("ethers");
function waterPlant(supabase, plantId, nftContractWrite) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data: plant, error: plantError } = yield supabase
            .from('plants')
            .select('health, last_watered, xp, plant_id')
            .eq('id', plantId)
            .single();
        if (plantError || !plant) {
            console.error('Failed to fetch plant:', plantError);
            return;
        }
        const today = new Date().toISOString();
        const newXP = plant.xp + 5; // increment XP by 5 on watering
        // Check to see if plant has been watered today
        // if (plant.last_watered === today) {
        //     console.log('Plant has already been watered today.');
        //     return;
        // }
        if (newXP >= 100) {
            const { data: updatedPlant, error: updateError } = yield supabase
                .from('plants')
                .update({
                health: Math.min(100, plant.health + 10),
                last_watered: today,
                xp: 100,
                ready_to_evolve: true
            })
                .eq('id', plantId)
                .select("*");
            try {
                const txResponse = yield nftContractWrite.setEligibility(plant.plant_id, true, {
                    gasLimit: 100000, // Adjust as necessary
                    gasPrice: ethers_1.ethers.parseUnits('10', 'gwei') // 10 gwei
                });
                // Transaction is sent, you can log the hash right away
                console.log(`Transaction hash: ${txResponse.hash}`);
                // Wait for the transaction to be confirmed
                const txReceipt = yield txResponse.wait();
                // Calculate the transaction cost
                const txCost = txReceipt.gasUsed;
                console.log(`Transaction cost in wei: ${txReceipt.gasUsed}`);
                // Convert wei to ether for a more readable format
                const txCostInEth = ethers_1.ethers.formatEther(txCost);
                console.log(`Transaction cost in ETH: ${txCostInEth}`);
            }
            catch (error) {
                console.error("Error during transaction", error);
                if (error instanceof Error) {
                    console.log(error.message); // More detailed error message
                }
            }
            if ((updatedPlant === null || updatedPlant === void 0 ? void 0 : updatedPlant[0]) && !updateError) {
                console.log("Plant watered AND ready to evolve: ", updatedPlant[0].id);
                return updatedPlant;
            }
            else if (updateError) {
                console.error("Error updating plant: ", updateError.message);
            }
        }
        else {
            const { data: updatedPlant, error: updateError } = yield supabase
                .from('plants')
                .update({
                health: Math.min(100, plant.health + 10),
                last_watered: today,
                xp: newXP
            })
                .eq('id', plantId)
                .select("*");
            if (updateError) {
                console.error('Failed to water plant:', updateError);
            }
            else {
                console.log('Plant watered successfully.');
                return updatedPlant;
            }
        }
    });
}
exports.waterPlant = waterPlant;
