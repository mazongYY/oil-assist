import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { hashPassword, verifyPassword, generateToken, authenticate } from './auth';
import * as db from './db';

const app = new Hono<{ Bindings: Env }>();

// CORS — 允许前端访问
app.use('*', cors({
  origin: (origin) => origin, // 允许所有来源（生产环境可限制）
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// 健康检查
app.get('/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// ==================== 认证 ====================

// 注册
app.post('/api/auth/register', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: '用户名和密码必填' }, 400);
    }
    if (password.length < 6) {
      return c.json({ error: '密码至少6位' }, 400);
    }
    
    // 检查用户名是否已存在
    const existingUser = await db.getUserByUsername(c.env, username);
    if (existingUser) {
      return c.json({ error: '用户名已存在' }, 409);
    }
    
    const passwordHash = await hashPassword(password);
    const user = await db.createUser(c.env, username, passwordHash);
    const token = await generateToken(user.id, user.username, c.env.JWT_SECRET);
    
    return c.json({ user: { id: user.id, username: user.username }, token }, 201);
  } catch (e) {
    return c.json({ error: '注册失败' }, 500);
  }
});

// 登录
app.post('/api/auth/login', async (c) => {
  try {
    const { username, email, password } = await c.req.json();
    
    if ((!username && !email) || !password) {
      return c.json({ error: '用户名/邮箱和密码必填' }, 400);
    }
    
    // 支持 username 或 email 登录
    let user;
    if (email) {
      user = await db.getUserByEmail(c.env, email);
    } else {
      user = await db.getUserByUsername(c.env, username);
    }
    if (!user) {
      return c.json({ error: '用户名或密码错误' }, 401);
    }
    
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return c.json({ error: '用户名或密码错误' }, 401);
    }
    
    const token = await generateToken(user.id, user.username, c.env.JWT_SECRET);
    
    return c.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (e) {
    return c.json({ error: '登录失败' }, 500);
  }
});

// 获取当前用户信息
app.get('/api/auth/me', async (c) => {
  const payload = await authenticate(c.req.raw, c.env);
  if (!payload) {
    return c.json({ error: '未登录' }, 401);
  }
  return c.json({ user: { id: payload.userId, username: payload.username } });
});

// ==================== 车辆 ====================

app.get('/api/vehicles', async (c) => {
  const payload = await authenticate(c.req.raw, c.env);
  if (!payload) return c.json({ error: '未登录' }, 401);
  
  const vehicles = await db.getVehicles(c.env, payload.userId);
  return c.json(vehicles);
});

app.get('/api/vehicles/:id', async (c) => {
  const payload = await authenticate(c.req.raw, c.env);
  if (!payload) return c.json({ error: '未登录' }, 401);
  
  const vehicle = await db.getVehicleById(c.env, c.req.param('id'), payload.userId);
  if (!vehicle) return c.json({ error: '车辆不存在' }, 404);
  
  return c.json(vehicle);
});

app.post('/api/vehicles', async (c) => {
  const payload = await authenticate(c.req.raw, c.env);
  if (!payload) return c.json({ error: '未登录' }, 401);
  
  const data = await c.req.json();
  if (!data.name) return c.json({ error: '车辆名称必填' }, 400);
  
  const vehicle = await db.createVehicle(c.env, payload.userId, {
    name: data.name,
    brand: data.brand || '',
    model: data.model || '',
    plate_number: data.plate_number || '',
    fuel_type: data.fuel_type || 'gasoline92',
    tank_capacity: data.tank_capacity || 0,
    avatar: data.avatar,
  });
  
  return c.json(vehicle, 201);
});

app.put('/api/vehicles/:id', async (c) => {
  const payload = await authenticate(c.req.raw, c.env);
  if (!payload) return c.json({ error: '未登录' }, 401);
  
  const data = await c.req.json();
  const vehicle = await db.updateVehicle(c.env, c.req.param('id'), payload.userId, data);
  if (!vehicle) return c.json({ error: '车辆不存在' }, 404);
  
  return c.json(vehicle);
});

app.delete('/api/vehicles/:id', async (c) => {
  const payload = await authenticate(c.req.raw, c.env);
  if (!payload) return c.json({ error: '未登录' }, 401);
  
  const ok = await db.deleteVehicle(c.env, c.req.param('id'), payload.userId);
  if (!ok) return c.json({ error: '车辆不存在' }, 404);
  
  return c.json({ success: true });
});

// ==================== 加油记录 ====================

app.get('/api/records', async (c) => {
  const payload = await authenticate(c.req.raw, c.env);
  if (!payload) return c.json({ error: '未登录' }, 401);
  
  const vehicleId = c.req.query('vehicleId');
  const records = vehicleId
    ? await db.getRecordsByVehicle(c.env, vehicleId, payload.userId)
    : await db.getRecords(c.env, payload.userId);
  
  return c.json(records);
});

app.get('/api/records/:id', async (c) => {
  const payload = await authenticate(c.req.raw, c.env);
  if (!payload) return c.json({ error: '未登录' }, 401);
  
  const record = await db.getRecordById(c.env, c.req.param('id'), payload.userId);
  if (!record) return c.json({ error: '记录不存在' }, 404);
  
  return c.json(record);
});

app.post('/api/records', async (c) => {
  const payload = await authenticate(c.req.raw, c.env);
  if (!payload) return c.json({ error: '未登录' }, 401);
  
  const data = await c.req.json();
  if (!data.vehicle_id || !data.date) {
    return c.json({ error: '车辆ID和日期必填' }, 400);
  }
  
  const record = await db.createRecord(c.env, payload.userId, {
    vehicle_id: data.vehicle_id,
    date: data.date,
    odometer: data.odometer || 0,
    liters: data.liters || 0,
    price_per_liter: data.price_per_liter || 0,
    total_cost: data.total_cost || 0,
    station: data.station || '',
    is_full: data.is_full ?? true,
    low_fuel_light: data.low_fuel_light ?? false,
    note: data.note || '',
  });
  
  return c.json(record, 201);
});

app.put('/api/records/:id', async (c) => {
  const payload = await authenticate(c.req.raw, c.env);
  if (!payload) return c.json({ error: '未登录' }, 401);
  
  const data = await c.req.json();
  const record = await db.updateRecord(c.env, c.req.param('id'), payload.userId, data);
  if (!record) return c.json({ error: '记录不存在' }, 404);
  
  return c.json(record);
});

app.delete('/api/records/:id', async (c) => {
  const payload = await authenticate(c.req.raw, c.env);
  if (!payload) return c.json({ error: '未登录' }, 401);
  
  const ok = await db.deleteRecord(c.env, c.req.param('id'), payload.userId);
  if (!ok) return c.json({ error: '记录不存在' }, 404);
  
  return c.json({ success: true });
});

export default app;
