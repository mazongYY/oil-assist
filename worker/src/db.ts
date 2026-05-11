import type { Env, User, Vehicle, FuelRecord } from './types';
import { generateId } from './auth';

// --- Users ---
export async function createUser(env: Env, username: string, passwordHash: string): Promise<User> {
  const id = generateId();
  const now = new Date().toISOString();
  
  await env.DB.prepare(
    'INSERT INTO users (id, username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, username, username, passwordHash, now, now).run();
  
  return { id, username, created_at: now, updated_at: now };
}

export async function getUserByUsername(env: Env, username: string): Promise<(User & { password_hash: string }) | null> {
  const result = await env.DB.prepare(
    'SELECT * FROM users WHERE username = ?'
  ).bind(username).first<User & { password_hash: string }>();
  
  return result || null;
}

export async function getUserByEmail(env: Env, email: string): Promise<User | null> {
  const result = await env.DB.prepare(
    'SELECT id, username, email, created_at, updated_at FROM users WHERE email = ?'
  ).bind(email).first<User>();
  
  return result || null;
}

// --- Vehicles ---
export async function getVehicles(env: Env, userId: string): Promise<Vehicle[]> {
  const result = await env.DB.prepare(
    'SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all<Vehicle>();
  
  return result.results;
}

export async function getVehicleById(env: Env, id: string, userId: string): Promise<Vehicle | null> {
  const result = await env.DB.prepare(
    'SELECT * FROM vehicles WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first<Vehicle>();
  
  return result || null;
}

export async function createVehicle(env: Env, userId: string, data: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
  const id = generateId();
  const now = new Date().toISOString();
  
  await env.DB.prepare(
    'INSERT INTO vehicles (id, user_id, name, brand, model, plate_number, fuel_type, tank_capacity, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, userId, data.name, data.brand, data.model, data.plate_number, data.fuel_type, data.tank_capacity, data.avatar || null, now, now).run();
  
  return { id, user_id: userId, ...data, created_at: now, updated_at: now };
}

export async function updateVehicle(env: Env, id: string, userId: string, data: Partial<Vehicle>): Promise<Vehicle | null> {
  const existing = await getVehicleById(env, id, userId);
  if (!existing) return null;
  
  const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
  
  await env.DB.prepare(
    'UPDATE vehicles SET name = ?, brand = ?, model = ?, plate_number = ?, fuel_type = ?, tank_capacity = ?, avatar = ?, updated_at = ? WHERE id = ? AND user_id = ?'
  ).bind(updated.name, updated.brand, updated.model, updated.plate_number, updated.fuel_type, updated.tank_capacity, updated.avatar || null, updated.updated_at, id, userId).run();
  
  return updated;
}

export async function deleteVehicle(env: Env, id: string, userId: string): Promise<boolean> {
  const result = await env.DB.prepare(
    'DELETE FROM vehicles WHERE id = ? AND user_id = ?'
  ).bind(id, userId).run();
  
  return (result.meta?.changes ?? 0) > 0;
}

// --- Fuel Records ---
export async function getRecords(env: Env, userId: string): Promise<FuelRecord[]> {
  const result = await env.DB.prepare(
    'SELECT * FROM fuel_records WHERE user_id = ? ORDER BY date DESC'
  ).bind(userId).all<FuelRecord>();
  
  return result.results;
}

export async function getRecordsByVehicle(env: Env, vehicleId: string, userId: string): Promise<FuelRecord[]> {
  const result = await env.DB.prepare(
    'SELECT * FROM fuel_records WHERE vehicle_id = ? AND user_id = ? ORDER BY date DESC'
  ).bind(vehicleId, userId).all<FuelRecord>();
  
  return result.results;
}

export async function getRecordById(env: Env, id: string, userId: string): Promise<FuelRecord | null> {
  const result = await env.DB.prepare(
    'SELECT * FROM fuel_records WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first<FuelRecord>();
  
  return result || null;
}

export async function createRecord(env: Env, userId: string, data: Omit<FuelRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FuelRecord> {
  const id = generateId();
  const now = new Date().toISOString();
  
  await env.DB.prepare(
    'INSERT INTO fuel_records (id, vehicle_id, user_id, date, odometer, liters, price_per_liter, total_cost, station, is_full, low_fuel_light, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, data.vehicle_id, userId, data.date, data.odometer, data.liters, data.price_per_liter, data.total_cost, data.station, data.is_full ? 1 : 0, data.low_fuel_light ? 1 : 0, data.note, now, now).run();
  
  return { id, user_id: userId, ...data, created_at: now, updated_at: now };
}

export async function updateRecord(env: Env, id: string, userId: string, data: Partial<FuelRecord>): Promise<FuelRecord | null> {
  const existing = await getRecordById(env, id, userId);
  if (!existing) return null;
  
  const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
  
  await env.DB.prepare(
    'UPDATE fuel_records SET date = ?, odometer = ?, liters = ?, price_per_liter = ?, total_cost = ?, station = ?, is_full = ?, low_fuel_light = ?, note = ?, updated_at = ? WHERE id = ? AND user_id = ?'
  ).bind(updated.date, updated.odometer, updated.liters, updated.price_per_liter, updated.total_cost, updated.station, updated.is_full ? 1 : 0, updated.low_fuel_light ? 1 : 0, updated.note, updated.updated_at, id, userId).run();
  
  return updated;
}

export async function deleteRecord(env: Env, id: string, userId: string): Promise<boolean> {
  const result = await env.DB.prepare(
    'DELETE FROM fuel_records WHERE id = ? AND user_id = ?'
  ).bind(id, userId).run();
  
  return (result.meta?.changes ?? 0) > 0;
}
