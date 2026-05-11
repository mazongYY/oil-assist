// DEPRECATED — 使用 api.ts 替代
// 保留此文件避免导入报错，但不再使用 localStorage

import type { Vehicle, FuelRecord } from './types';

export function getVehicles(): Vehicle[] { return []; }
export function saveVehicle(): Vehicle { throw new Error('Use api.createVehicle'); }
export function updateVehicle(): Vehicle | null { throw new Error('Use api.updateVehicle'); }
export function deleteVehicle(): boolean { throw new Error('Use api.deleteVehicle'); }
export function getVehicleById(): Vehicle | undefined { return undefined; }
export function getRecords(): FuelRecord[] { return []; }
export function getRecordsByVehicle(): FuelRecord[] { return []; }
export function saveRecord(): FuelRecord { throw new Error('Use api.createRecord'); }
export function deleteRecord(): boolean { throw new Error('Use api.deleteRecord'); }
export function updateRecord(): FuelRecord | null { throw new Error('Use api.updateRecord'); }
