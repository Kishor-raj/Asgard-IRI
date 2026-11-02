const crypto = require('crypto');

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Sign a payload into an HMAC-SHA256 JWT token using process.env.SESSION_SECRET.
 * Zero external dependencies.
 */
function signToken(payload, expiresInSeconds = 7 * 24 * 3600) {
  const secret = process.env.SESSION_SECRET || 'asgard-iri-secure-jwt-secret';
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = JSON.stringify({
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  });

  const headerB64 = base64UrlEncode(header);
  const payloadB64 = base64UrlEncode(fullPayload);
  const message = `${headerB64}.${payloadB64}`;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  const signature = hmac.digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${message}.${signature}`;
}

/**
 * Verify an HMAC-SHA256 JWT token.
 * Returns decoded payload object if valid and unexpired; otherwise returns null.
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  const message = `${headerB64}.${payloadB64}`;

  const secret = process.env.SESSION_SECRET || 'asgard-iri-secure-jwt-secret';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  const expectedSignature = hmac.digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  signToken,
  verifyToken,
};
