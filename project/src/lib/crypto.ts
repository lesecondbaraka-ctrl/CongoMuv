const te = new TextEncoder();
const td = new TextDecoder();

function b64encode(a: ArrayBuffer) {
  const bytes = new Uint8Array(a);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str);
}

function b64decode(s: string) {
  const bin = atob(s);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(passphrase: string, salt: ArrayBuffer) {
  const keyMaterial = await crypto.subtle.importKey("raw", te.encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function encryptString(value: string) {
  const secret = (import.meta as any).env.VITE_APP_ENCRYPTION_KEY as string;
  if (!secret) {
    console.warn("Missing VITE_APP_ENCRYPTION_KEY - encryption disabled");
    return value; // Return plain value if no encryption key
  }
  const salt = crypto.getRandomValues(new Uint8Array(16)).buffer;
  const iv = crypto.getRandomValues(new Uint8Array(12)).buffer;
  const key = await deriveKey(secret, salt);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, te.encode(value));
  const payload = new Uint8Array((salt as ArrayBuffer).byteLength + (iv as ArrayBuffer).byteLength + (ct as ArrayBuffer).byteLength);
  payload.set(new Uint8Array(salt), 0);
  payload.set(new Uint8Array(iv), 16);
  payload.set(new Uint8Array(ct), 28);
  return b64encode(payload.buffer);
}

export async function decryptString(payloadB64: string) {
  const secret = (import.meta as any).env.VITE_APP_ENCRYPTION_KEY as string;
  if (!secret) {
    console.warn("Missing VITE_APP_ENCRYPTION_KEY - decryption disabled");
    return payloadB64; // Return plain value if no encryption key
  }
  try {
    const buf = b64decode(payloadB64);
    const salt = buf.slice(0, 16);
    const iv = buf.slice(16, 28);
    const ct = buf.slice(28);
    const key = await deriveKey(secret, salt);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return td.decode(pt);
  } catch (error) {
    console.warn("Decryption failed, returning original value:", error);
    return payloadB64; // Return original if decryption fails
  }
}
