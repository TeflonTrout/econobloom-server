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
exports.growEventListener = void 0;
function growEventListener(supabase, nftContract) {
    try {
        nftContract.on("GrowthStageUpdated", (tokenId, newGrowthStage, event) => __awaiter(this, void 0, void 0, function* () {
            const tokenIdStr = tokenId.toString(); // Convert BigInt to string
            const newGrowthStageStr = newGrowthStage.toString(); // Convert BigInt to string if necessary
            console.log(`Growth Stage Updated for token ID ${tokenIdStr}: New Stage ${newGrowthStageStr}`);
            // Update the plant in Supabase
            const { data, error } = yield supabase
                .from('plants')
                .update({
                growth_stage: newGrowthStageStr,
                xp: 0, // Reset XP
                ready_to_evolve: false // Reset eligibility for evolution
            })
                .eq('plant_id', tokenIdStr); // Assuming plant_id is how you relate tokens to rows
            if (error) {
                console.error('Error updating plant in Supabase:', error);
            }
            else {
                console.log('Plant updated successfully in Supabase:', data);
            }
        }));
    }
    catch (error) {
        console.error('Error updating plant in Supabase:', error);
    }
}
exports.growEventListener = growEventListener;
