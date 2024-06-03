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
exports.growPlant = void 0;
function growPlant(supabase, plantId) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data: plant, error: plantError } = yield supabase
            .from('plants')
            .select('*')
            .eq('id', plantId)
            .single();
        if (plantError || !plant) {
            console.error('Failed to fetch plant:', plantError);
            return { error: 'Failed to fetch plant' };
        }
        console.log(plant, plant.ready_to_evolve);
        // // Check if plant is eligible to evolve
        // if (!plant.ready_to_evolve) {
        //     return { error: 'Plant is not ready to evolve' };
        // }
        // Increment the growth stage and reset ready_to_evolve
        const { data: updatedPlant, error: updateError } = yield supabase
            .from('plants')
            .update({
            growth_stage: Number(plant.growth_stage + 1),
            xp: 0, // Reset XP or adjust as needed
            ready_to_evolve: false
        })
            .eq('id', plantId)
            .select("*");
        console.log("******************************", updatedPlant);
        if (updateError) {
            console.error('Failed to grow plant:', updateError);
            return { error: 'Failed to grow plant' };
        }
        else {
            console.log('Plant grown successfully.');
            return updatedPlant;
        }
    });
}
exports.growPlant = growPlant;
