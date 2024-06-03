import { Contract } from "ethers";
import { PlantType, Plant, MarketCondition } from "../../types/plant";
import { SupabaseClient } from "@supabase/supabase-js"; 

export function mintEventListener(supabase:SupabaseClient, nftContract: Contract, market_uuid:string) {
    // Listening to the PlantMinted event
    nftContract.on("PlantMinted", async (tokenId, owner, plantType:PlantType) => {
        console.log(`New Plant NFT Minted: ${tokenId} by ${owner} of type ${plantType}`);

        const date = new Date
        const timestamp = date.toISOString();

        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq("wallet_address", owner)
            .single();

        if(error) {
            console.log("Error finding owner_id of player.")
            return
        }

        const newPlant: Plant = {
            _creation_time: timestamp,
            growth_stage: 0,
            health: 100,
            last_market_check: timestamp,
            last_watered: null,
            market_effect: MarketCondition.Stable,  // Enum value
            market_condition_id: market_uuid,
            owner_id: data.id,
            plant_id: BigInt(tokenId).toString(),
            type: plantType,  // Enum value
            wallet_address: owner,
            xp: 0,
            ready_to_evolve: false
        };

        console.log("New Plant addded to Database: ", newPlant.plant_id)
        // Add the new plant to the Supabase database
        try {
            const { data, error } = await supabase
                .from('plants')
                .insert([newPlant]);

            if (error) {
                throw error;
            }
            console.log('Supabase update successful:', data);
        } catch (error) {
            console.error('Error updating Supabase:', error);
        }
    });
}

