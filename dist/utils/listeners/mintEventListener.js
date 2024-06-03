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
exports.mintEventListener = void 0;
const plant_1 = require("../../types/plant");
function mintEventListener(supabase, nftContract, market_uuid) {
    // Listening to the PlantMinted event
    nftContract.on("PlantMinted", (tokenId, owner, plantType) => __awaiter(this, void 0, void 0, function* () {
        console.log(`New Plant NFT Minted: ${tokenId} by ${owner} of type ${plantType}`);
        const date = new Date;
        const timestamp = date.toISOString();
        const { data, error } = yield supabase
            .from('players')
            .select('*')
            .eq("wallet_address", owner)
            .single();
        if (error) {
            console.log("Error finding owner_id of player.");
            return;
        }
        const newPlant = {
            _creation_time: timestamp,
            growth_stage: 0,
            health: 100,
            last_market_check: timestamp,
            last_watered: null,
            market_effect: plant_1.MarketCondition.Stable, // Enum value
            market_condition_id: market_uuid,
            owner_id: data.id,
            plant_id: BigInt(tokenId).toString(),
            type: plantType, // Enum value
            wallet_address: owner,
            xp: 0,
            ready_to_evolve: false
        };
        console.log("New Plant addded to Database: ", newPlant.plant_id);
        // Add the new plant to the Supabase database
        try {
            const { data, error } = yield supabase
                .from('plants')
                .insert([newPlant]);
            if (error) {
                throw error;
            }
            console.log('Supabase update successful:', data);
        }
        catch (error) {
            console.error('Error updating Supabase:', error);
        }
    }));
}
exports.mintEventListener = mintEventListener;
