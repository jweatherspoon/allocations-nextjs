import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { SessionPayload } from '@/app/lib/models/auth/session-payload.model';
import { cookies } from 'next/headers';
import { redirect } from 'next/dist/client/components/navigation';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encodedKey);

  return jwt;
}

export async function decrypt(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });

    return payload as SessionPayload;
  } catch (error) {
    console.error('Failed to verify JWT:', error);
    throw new Error('Invalid or expired session token');
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  const payload: SessionPayload = {
    exp: Math.floor(expiresAt.getTime() / 1000),
    userData: {
      userId,
    },
  };

  const sessionToken = await encrypt(payload);
  const cookieStore = await cookies();

  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  try {
    if (!sessionToken) {
      throw new Error('No session token found');
    }

    const payload = await decrypt(sessionToken);
    return payload;
  } catch (error) {
    console.error('Failed to verify session:', error);
    redirect('/login');
  }
}
