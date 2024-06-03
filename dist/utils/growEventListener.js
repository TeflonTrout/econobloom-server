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
    nftContract.on("GrowthStageUpdated", (tokenId, newGrowthStage, event) => __awaiter(this, void 0, void 0, function* () {
        console.log(`Growth Stage Updated for token ID ${tokenId.toString()}: New Stage ${newGrowthStage.toString()}`);
        // Update the plant in Supabase
        const { data, error } = yield supabase
            .from('plants')
            .update({
            growth_stage: newGrowthStage,
            xp: 0, // Reset XP
            ready_to_evolve: false // Reset eligibility for evolution
        })
            .eq('plant_id', BigInt(tokenId).toString()); // Assuming plant_id is how you relate tokens to rows
        if (error) {
            console.error('Error updating plant in Supabase:', error);
        }
        else {
            console.log('Plant updated successfully in Supabase:', data);
        }
    }));
}
exports.growEventListener = growEventListener;
