import { SupabaseClient } from "@supabase/supabase-js";

export async function growPlant(supabase: SupabaseClient, plantId: string) {
    const { data: plant, error: plantError } = await supabase
        .from('plants')
        .select('*')
        .eq('id', plantId)
        .single();

    if (plantError || !plant) {
        console.error('Failed to fetch plant:', plantError);
        return { error: 'Failed to fetch plant' };
    }

    console.log(plant, plant.ready_to_evolve)

    // // Check if plant is eligible to evolve
    // if (!plant.ready_to_evolve) {
    //     return { error: 'Plant is not ready to evolve' };
    // }

    // Increment the growth stage and reset ready_to_evolve
    const { data: updatedPlant, error: updateError } = await supabase
        .from('plants')
        .update({
            growth_stage: Number(plant.growth_stage + 1),
            xp: 0, // Reset XP or adjust as needed
            ready_to_evolve: false
        })
        .eq('id', plantId)
        .select("*");

        console.log("******************************", updatedPlant)
    if (updateError) {
        console.error('Failed to grow plant:', updateError);
        return { error: 'Failed to grow plant' };
    } else {
        console.log('Plant grown successfully.');
        return updatedPlant;
    }
}