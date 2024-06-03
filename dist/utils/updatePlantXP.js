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
exports.updatePlantXP = void 0;
const updatePlantXP = (supabase) => __awaiter(void 0, void 0, void 0, function* () {
    const { data: plants, error } = yield supabase
        .from('plants')
        .select('*');
    if (error) {
        console.error('Failed to fetch plants:', error);
        return;
    }
    plants.forEach((plant) => __awaiter(void 0, void 0, void 0, function* () {
        if (plant.health >= 85) { // If health is above 85, increment XP
            const newXP = plant.xp + 10;
            if (newXP >= 100) {
                const { data, error } = yield supabase
                    .from('plants')
                    .update({ xp: 100, ready_to_evolve: true })
                    .eq('id', plant.id)
                    .select("*");
                if ((data === null || data === void 0 ? void 0 : data[0]) && !error) {
                    console.log("Plant ready to evolve: ", data[0].id);
                }
                else if (error) {
                    console.error("Error updating plant: ", error.message);
                }
            }
            else {
                const { data, error } = yield supabase
                    .from('plants')
                    .update({ xp: newXP })
                    .eq('id', plant.id)
                    .select("*");
                if ((data === null || data === void 0 ? void 0 : data[0]) && !error) {
                    console.log("Updated plant: ", data[0].id);
                }
                else if (error) {
                    console.error("Error updating plant: ", error.message);
                }
            }
        }
    }));
});
exports.updatePlantXP = updatePlantXP;
