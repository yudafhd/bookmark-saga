/* Google Drive AppData sync helpers */
import { exportAll, importAll, type SyncPayload } from './sync';

const TOKEN_KEY = 'gdriveAccessToken';
const TOKEN_EXP_KEY = 'gdriveTokenExpiresAt';
const FILE_NAME = 'bookmark-saga-settings.json';
const APP_PROPERTIES = {
  app: 'bookmark-saga',
  type: 'settings',
  version: '1',
} as const;
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function getClientId(): string | null {
  const cid = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
  return cid && cid.trim().length > 0 ? cid.trim() : null;
}

export function getRedirectUri(): string {
  return chrome.identity.getRedirectURL();
}

function parseTokenFromRedirectUrl(url: string): { accessToken: string; expiresIn: number } | null {
  try {
    const hash = url.split('#')[1] ?? '';
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const expiresIn = Number(params.get('expires_in') || '0');
    if (accessToken && expiresIn > 0) {
      return { accessToken, expiresIn };
    }
  } catch { }
  return null;
}

async function saveToken(token: string, expiresInSec: number): Promise<void> {
  const exp = nowSeconds() + Math.max(0, Math.floor(expiresInSec)) - 30; // small safety margin
  await chrome.storage.local.set({ [TOKEN_KEY]: token, [TOKEN_EXP_KEY]: exp });
}

async function loadValidToken(): Promise<string | null> {
  const { [TOKEN_KEY]: token, [TOKEN_EXP_KEY]: exp } = await chrome.storage.local.get({
    [TOKEN_KEY]: null as string | null,
    [TOKEN_EXP_KEY]: 0 as number,
  });
  if (typeof token === 'string' && token && typeof exp === 'number' && nowSeconds() < exp) {
    return token;
  }
  return null;
}

async function authorizeInteractive(): Promise<string> {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error('Missing Google OAuth client id. Set VITE_GOOGLE_CLIENT_ID.');
  }
  const redirectUri = getRedirectUri();
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', DRIVE_SCOPE);
  authUrl.searchParams.set('include_granted_scopes', 'true');
  authUrl.searchParams.set('prompt', 'consent');

  const redirect = await chrome.identity.launchWebAuthFlow({
    url: authUrl.toString(),
    interactive: true,
  });
  const parsed = parseTokenFromRedirectUrl(String(redirect));
  if (!parsed) throw new Error('Authorization failed: no access token.');
  await saveToken(parsed.accessToken, parsed.expiresIn);
  return parsed.accessToken;
}

async function getAccessToken(): Promise<string> {
  const cached = await loadValidToken();
  if (cached) return cached;
  return await authorizeInteractive();
}

async function authorizedFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

async function findExistingFile(): Promise<{ id: string; modifiedTime?: string } | null> {
  const q = [
    `name = '${FILE_NAME.replace(/'/g, "\\'")}'`,
    "'appDataFolder' in parents",
    "appProperties has { key = 'app' and value = 'bookmark-saga' }",
    "appProperties has { key = 'type' and value = 'settings' }",
    'trashed = false',
  ].join(' and ');
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('spaces', 'appDataFolder');
  url.searchParams.set('fields', 'files(id,name,modifiedTime)');
  url.searchParams.set('q', q);
  const res = await authorizedFetch(url.toString(), { method: 'GET' });
  if (!res.ok) throw new Error(`Drive list failed: ${res.status}`);
  const data = await res.json();
  const files = Array.isArray(data.files) ? data.files : [];
  if (files.length > 0) return { id: files[0].id, modifiedTime: files[0].modifiedTime };
  return null;
}

function buildMultipartBody(metadata: Record<string, any>, content: string): { body: Blob; boundary: string } {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close = `\r\n--${boundary}--`;
  const parts = [
    delimiter,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    delimiter,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    content,
    close,
  ];
  const body = new Blob(parts as any, { type: `multipart/related; boundary="${boundary}"` });
  return { body, boundary };
}

export async function uploadToAppData(): Promise<{ id: string }> {
  const payload = await exportAll();
  const content = JSON.stringify(payload);
  const existing = await findExistingFile();

  const baseMeta = { name: FILE_NAME, appProperties: APP_PROPERTIES } as const;
  const metadata = existing
    ? baseMeta
    : { ...baseMeta, parents: ['appDataFolder'] };

  const { body, boundary } = buildMultipartBody(metadata, content);
  const url = new URL('https://www.googleapis.com/upload/drive/v3/files');
  url.searchParams.set('uploadType', 'multipart');
  if (existing) {
    // For update, use PATCH to /files/{id}
    const res = await authorizedFetch(`https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart`, {
      method: 'PATCH',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
    if (!res.ok) throw new Error(`Drive update failed: ${res.status}`);
    const data = await res.json();
    return { id: data.id };
  } else {
    const res = await authorizedFetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
    if (!res.ok) throw new Error(`Drive upload failed: ${res.status}`);
    const data = await res.json();
    return { id: data.id };
  }
}

export async function downloadFromAppData(): Promise<SyncPayload | null> {
  const existing = await findExistingFile();
  if (!existing) return null;
  const url = `https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`;
  const res = await authorizedFetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
  const json = await res.json();
  return json as SyncPayload;
}

export async function importFromAppData(): Promise<{ applied: boolean }> {
  const payload = await downloadFromAppData();
  if (!payload) return { applied: false };
  await importAll(payload);
  return { applied: true };
}

export async function signOutDrive(): Promise<void> {
  const { [TOKEN_KEY]: token } = await chrome.storage.local.get({ [TOKEN_KEY]: null as string | null });
  if (token) {
    try {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token }),
      });
    } catch { }
  }
  await chrome.storage.local.remove([TOKEN_KEY, TOKEN_EXP_KEY]);
}

export async function getAuthStatus(): Promise<{ authorized: boolean; expiresAt?: number }> {
  const { [TOKEN_KEY]: token, [TOKEN_EXP_KEY]: exp } = await chrome.storage.local.get({
    [TOKEN_KEY]: null as string | null,
    [TOKEN_EXP_KEY]: 0 as number,
  });
  return { authorized: Boolean(token && typeof exp === 'number' && exp > nowSeconds()), expiresAt: exp || undefined };
}
