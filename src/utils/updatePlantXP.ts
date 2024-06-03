import { SupabaseClient } from "@supabase/supabase-js";
import { Plant } from "../types/plant";

export const updatePlantXP = async (supabase:SupabaseClient) => {
    const { data: plants, error } = await supabase
        .from('plants')
        .select('*');

    if (error) {
        console.error('Failed to fetch plants:', error);
        return;
    }

    plants.forEach(async (plant:Plant) => {
        if (plant.health >= 85) { // If health is above 85, increment XP
            const newXP = plant.xp + 10;
            if (newXP >= 100) {
                const { data, error } = await supabase
                    .from('plants')
                    .update({ xp: 100, ready_to_evolve: true })
                    .eq('id', plant.id)
                    .select("*")
                if (data?.[0] && !error) {
                    console.log("Plant ready to evolve: ", data[0].id);
                } else if (error) {
                    console.error("Error updating plant: ", error.message);
                }
            } else {
                const { data, error } = await supabase
                    .from('plants')
                    .update({ xp: newXP })
                    .eq('id', plant.id)
                    .select("*")
                if (data?.[0] && !error) {
                    console.log("Updated plant: ", data[0].id);
                } else if (error) {
                    console.error("Error updating plant: ", error.message);
                }
            }
        }
    });
}