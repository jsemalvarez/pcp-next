import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Se resuelve al usarla (no al importar) para no romper el build si falta la variable,
// pero nunca firma ni verifica con una clave vacía o débil.
let key: Uint8Array | null = null;
function getKey() {
  if (key) return key;
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET no está definido o tiene menos de 32 caracteres.');
  }
  key = new TextEncoder().encode(secret);
  return key;
}

export type SessionPayload = {
  userId: string;
  role: string;
  expires: string;
};

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(getKey());
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, getKey(), {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, role: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 día
  const session = await encrypt({ userId, role, expires: expires.toISOString() });

  (await cookies()).set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function destroySession() {
  (await cookies()).set('session', '', { expires: new Date(0), path: '/' });
}
