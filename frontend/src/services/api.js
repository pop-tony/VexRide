const defaultApiBaseUrl = import.meta.env.API_BASE_URL;

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || defaultApiBaseUrl;

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export async function postJson(path, body) {
  return requestJson(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export async function getJson(path) {
  return requestJson(path, { method: 'GET' });
}
