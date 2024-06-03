import { SupabaseClient } from "@supabase/supabase-js";
import { Contract } from "ethers";

export function growEventListener(supabase:SupabaseClient, nftContract: Contract) {
    try {
        nftContract.on("GrowthStageUpdated", async (tokenId, newGrowthStage, event) => {
            const tokenIdStr = tokenId.toString(); // Convert BigInt to string
            const newGrowthStageStr = newGrowthStage.toString(); // Convert BigInt to string if necessary
            
            console.log(`Growth Stage Updated for token ID ${tokenIdStr}: New Stage ${newGrowthStageStr}`);
                
            // Update the plant in Supabase
            const { data, error } = await supabase
                .from('plants')
                .update({
                    growth_stage: newGrowthStageStr,
                    xp: 0, // Reset XP
                    ready_to_evolve: false // Reset eligibility for evolution
                })
                .eq('plant_id', tokenIdStr); // Assuming plant_id is how you relate tokens to rows
        
            if (error) {
                console.error('Error updating plant in Supabase:', error);
            } else {
                console.log('Plant updated successfully in Supabase:', data);
            }
        });
    } catch (error) {
        console.error('Error updating plant in Supabase:', error);
    }
}