import { Contract } from "ethers";
import { MarketCondition } from "../types/plant";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updatePlantGrowthBasedOnRSI(supabase:SupabaseClient, contract:Contract, MARKET_CONDITION_UUID:string) {
    console.log('Updating Plant Growth...');
    
    try {    
        const txResponse = await contract.requestMarketData();
        // Transaction is sent, you can log the hash right away
        console.log(`Transaction hash: ${txResponse.hash}`);
        
        // Wait for the transaction to be confirmed
        const txReceipt = await txResponse.wait();
        console.log(`Transaction receipt: ${txReceipt}`);

         // Get the current RSI from the smart contract
         const rsiValue = await contract.getRSI();
         console.log("The RSI value is:", rsiValue.toString());
         
         // Define growth conditions based on RSI
         const growthCondition:MarketCondition = rsiValue > 60 ? MarketCondition.Fast : rsiValue < 40 ? MarketCondition.Slow : MarketCondition.Stable;
         console.log("Current Growth Conditions : ", growthCondition)
 
         // Update market_conditions in Supabase
         const { data, error:supabaseError } = await supabase
             .from('market_conditions')
             .update({ current_condition: growthCondition })
             .eq('id', MARKET_CONDITION_UUID)
             .select("*"); // RETURN THE UPDATED ROW
 
         if (supabaseError) {
             console.error('Error updating Supabase:', supabaseError);
         } else {
             console.log('Updated plant growth conditions:', data);
         }
        } catch (error) {
    
       console.error("Error updating RSI: ", error)
    }
}

