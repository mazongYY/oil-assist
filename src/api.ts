import type { Vehicle, FuelRecord } from './types';

// API 基础地址 — 开发环境用本地，生产环境用 Cloudflare
const API_BASE = import.meta.env.VITE_API_URL || 'https://oil-assist-api.morning-galaxy-dawn.workers.dev';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('oil-assist-token');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      this.logout();
      window.location.href = '/login';
      throw new Error('未登录');
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || '请求失败');
    }

    return data;
  }

  // 认证
  async register(username: string, password: string) {
    const data = await this.request<{ user: { id: string; username: string }; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.token = data.token;
    localStorage.setItem('oil-assist-token', data.token);
    return data;
  }

  async login(username: string, password: string) {
    const data = await this.request<{ user: { id: string; username: string; email: string }; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.token = data.token;
    localStorage.setItem('oil-assist-token', data.token);
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('oil-assist-token');
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  async getMe() {
    return this.request<{ user: { id: string; username: string } }>('/api/auth/me');
  }

  // 车辆
  async getVehicles(): Promise<Vehicle[]> {
    return this.request('/api/vehicles');
  }

  async getVehicle(id: string): Promise<Vehicle> {
    return this.request(`/api/vehicles/${id}`);
  }

  async createVehicle(data: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
    return this.request('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    return this.request(`/api/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVehicle(id: string): Promise<void> {
    await this.request(`/api/vehicles/${id}`, { method: 'DELETE' });
  }

  // 加油记录
  async getRecords(vehicleId?: string): Promise<FuelRecord[]> {
    const query = vehicleId ? `?vehicleId=${vehicleId}` : '';
    return this.request(`/api/records${query}`);
  }

  async getRecord(id: string): Promise<FuelRecord> {
    return this.request(`/api/records/${id}`);
  }

  async createRecord(data: Omit<FuelRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FuelRecord> {
    return this.request('/api/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecord(id: string, data: Partial<FuelRecord>): Promise<FuelRecord> {
    return this.request(`/api/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRecord(id: string): Promise<void> {
    await this.request(`/api/records/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
