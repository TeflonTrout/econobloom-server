"use strict";
// src/utils/updatePlantHealth.ts
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
exports.updatePlantHealth = void 0;
function updatePlantHealth(supabase) {
    return __awaiter(this, void 0, void 0, function* () {
        const marketCondition = yield getMarketCondition(supabase); // Assume this returns 'fast', 'stable', or 'slow'
        console.log('Current Condition: ', marketCondition);
        let decrement = 0;
        if (marketCondition === 'fast') {
            decrement = 10;
        }
        else if (marketCondition === 'stable') {
            decrement = 20;
        }
        else if (marketCondition === 'slow') {
            decrement = 30;
        }
        console.log('Reducing Plant Health by: ', decrement);
        // Fetch current plants data
        // Fetch all plant IDs and their current health
        const { data: plants, error: plantError } = yield supabase
            .from('plants')
            .select('id, health');
        if (plantError) {
            console.error('Error fetching plants:', plantError);
            return;
        }
        else {
            console.log("Current Plants: ", plants);
        }
        // Update each plant's health
        const updates = plants.map(plant => ({
            id: plant.id,
            health: Math.max(0, plant.health - decrement) // Ensure health does not go below zero
        }));
        console.log("Updates: ", updates);
        const { data: updatedPlants, error: updateError } = yield supabase
            .from('plants')
            .upsert(updates);
        if (updateError) {
            console.error('Failed to update plants:', updateError);
        }
        else {
            console.log('Plants updated successfully:', updatedPlants);
        }
    });
}
exports.updatePlantHealth = updatePlantHealth;
function getMarketCondition(supabase) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data: marketCondition, error: marketError } = yield supabase
            .from('market_conditions')
            .select('current_condition')
            .single();
        if (marketError || !marketCondition) {
            console.error('Error fetching market conditions:', marketError);
            return null;
        }
        return marketCondition.current_condition; // This should come from real market data
    });
}
