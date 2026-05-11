export interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  model: string;
  plate_number: string;
  fuel_type: 'gasoline92' | 'gasoline95' | 'gasoline98' | 'diesel';
  tank_capacity: number;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface FuelRecord {
  id: string;
  vehicle_id: string;
  user_id: string;
  date: string;
  odometer: number;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  station: string;
  is_full: boolean;
  low_fuel_light: boolean;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface StatsSummary {
  totalCost: number;
  totalLiters: number;
  totalDistance: number;
  avgConsumption: number;
  avgCostPerKm: number;
  recordCount: number;
}

export const FUEL_TYPE_LABELS: Record<Vehicle['fuel_type'], string> = {
  gasoline92: '92号汽油',
  gasoline95: '95号汽油',
  gasoline98: '98号汽油',
  diesel: '柴油',
};

export const VEHICLE_AVATARS = ['🚗', '🚙', '🚕', '🏎️', '🚐', '🛻', '🏍️', '🛵', '🚕', '🚌'];
