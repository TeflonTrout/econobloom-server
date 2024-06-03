// /backend/utils/plantUtils.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Contract, ethers } from 'ethers';

export async function waterPlant(supabase:SupabaseClient, plantId: string, nftContractWrite: Contract) {
    const { data: plant, error: plantError } = await supabase
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

    if(newXP >= 100) {
        const { data: updatedPlant, error: updateError } = await supabase
            .from('plants')
            .update({ 
                health: Math.min(100, plant.health + 10),
                last_watered: today,    
                xp: 100, 
                ready_to_evolve: true })
            .eq('id', plantId)
            .select("*")

            try {
                const txResponse = await nftContractWrite.setEligibility(plant.plant_id, true, {
                    gasLimit: 100000, // Adjust as necessary
                    gasPrice: ethers.parseUnits('10', 'gwei')  // 10 gwei
                });
            
                // Transaction is sent, you can log the hash right away
                console.log(`Transaction hash: ${txResponse.hash}`);
            
                // Wait for the transaction to be confirmed
                const txReceipt = await txResponse.wait();
            
                // Calculate the transaction cost
                const txCost = txReceipt.gasUsed;
                console.log(`Transaction cost in wei: ${txReceipt.gasUsed}`)
            
                // Convert wei to ether for a more readable format
                const txCostInEth = ethers.formatEther(txCost);
                console.log(`Transaction cost in ETH: ${txCostInEth}`);
            
            } catch (error) {
                console.error("Error during transaction", error);
                if (error instanceof Error) {
                    console.log(error.message); // More detailed error message
                }
            }
            

        if (updatedPlant?.[0] && !updateError) {
            console.log("Plant watered AND ready to evolve: ", updatedPlant[0].id);
            return updatedPlant
        } else if (updateError) {
            console.error("Error updating plant: ", updateError.message);
        }
    } else {
        const { data: updatedPlant, error: updateError } = await supabase
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
        } else {
            console.log('Plant watered successfully.');
            return updatedPlant;
        }
    }
}
