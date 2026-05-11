import type { JwtPayload, Env } from './types';

// 简单的 JWT 实现（不依赖外部库）
async function createJwt(payload: JwtPayload, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encoder = new TextEncoder();
  
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${data}.${signatureB64}`;
}

async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    const encoder = new TextEncoder();
    
    const data = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    // Decode signature
    const sigStr = atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/'));
    const signature = new Uint8Array([...sigStr].map(c => c.charCodeAt(0)));
    
    const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
    if (!valid) return null;
    
    const payload: JwtPayload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

// Password hashing using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const data = encoder.encode(password);
  
  // Combine salt + password
  const combined = new Uint8Array(salt.length + data.length);
  combined.set(salt);
  combined.set(data, salt.length);
  
  // Hash with SHA-256 (multiple rounds)
  let hash = combined;
  for (let i = 0; i < 10000; i++) {
    hash = new Uint8Array(await crypto.subtle.digest('SHA-256', hash));
  }
  
  // Return salt:hash as base64
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...hash));
  return `${saltB64}:${hashB64}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltB64, expectedHashB64] = storedHash.split(':');
  const encoder = new TextEncoder();
  
  const salt = new Uint8Array([...atob(saltB64)].map(c => c.charCodeAt(0)));
  const data = encoder.encode(password);
  
  const combined = new Uint8Array(salt.length + data.length);
  combined.set(salt);
  combined.set(data, salt.length);
  
  let hash = combined;
  for (let i = 0; i < 10000; i++) {
    hash = new Uint8Array(await crypto.subtle.digest('SHA-256', hash));
  }
  
  const hashB64 = btoa(String.fromCharCode(...hash));
  return hashB64 === expectedHashB64;
}

export async function generateToken(userId: string, username: string, secret: string): Promise<string> {
  const payload: JwtPayload = {
    userId,
    username,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };
  return createJwt(payload, secret);
}

export async function authenticate(request: Request, env: Env): Promise<JwtPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.slice(7);
  return verifyJwt(token, env.JWT_SECRET);
}

export function generateId(): string {
  return crypto.randomUUID();
}
