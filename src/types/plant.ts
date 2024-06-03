// Using enums
export enum MarketCondition {
  Fast = "fast",
  Slow = "slow",
  Stable = "stable"
}

export enum PlantType {
  Cactus = "Cactus",
  Vine = "Vine",
  // add other plant types as needed
}

// Using string literals
export type MarketConditionLiteral = "fast" | "slow" | "stable";
type PlantTypeLiteral = "Cactus" | "Vine" | "YourOtherPlantType";

// Define the Plant interface using these types
export interface Plant {
  id?: string;
  _creation_time: string;
  growth_stage: number;
  health: number;
  last_market_check: string;
  last_watered: string | null;
  market_effect: MarketCondition;  // Using enum here
  market_condition_id: string;
  owner_id: string | null;
  plant_id: string;
  type: PlantType;  // Using enum here
  wallet_address: string;
  xp: number;
  ready_to_evolve: boolean;
}
