// src/utils/updatePlantHealth.ts

import { SupabaseClient } from '@supabase/supabase-js';

export async function updatePlantHealth(supabase:SupabaseClient): Promise<void> {
    const marketCondition = await getMarketCondition(supabase); // Assume this returns 'fast', 'stable', or 'slow'

    console.log('Current Condition: ', marketCondition)

    let decrement = 0;
    if (marketCondition === 'fast') {
        decrement = 10;
    } else if (marketCondition === 'stable') {
        decrement = 20;
    } else if (marketCondition === 'slow') {
        decrement = 30;
    }

    console.log('Reducing Plant Health by: ', decrement)

    // Fetch current plants data
    // Fetch all plant IDs and their current health
    const { data: plants, error: plantError } = await supabase
        .from('plants')
        .select('id, health');

    if (plantError) {
        console.error('Error fetching plants:', plantError);
        return;
    } else {
        console.log("Current Plants: ", plants)
    }

     // Update each plant's health
     const updates = plants.map(plant => ({
        id: plant.id,
        health: Math.max(0, plant.health - decrement) // Ensure health does not go below zero
    }));

    console.log("Updates: ", updates)

    const { data: updatedPlants, error: updateError } = await supabase
        .from('plants')
        .upsert(updates);

    if (updateError) {
        console.error('Failed to update plants:', updateError);
    } else {
        console.log('Plants updated successfully:', updatedPlants);
    }
}

async function getMarketCondition(supabase:SupabaseClient) {
    const { data: marketCondition, error: marketError } = await supabase
        .from('market_conditions')
        .select('current_condition')
        .single();

    if (marketError || !marketCondition) {
        console.error('Error fetching market conditions:', marketError);
        return null
    }    

    return marketCondition.current_condition; // This should come from real market data
}