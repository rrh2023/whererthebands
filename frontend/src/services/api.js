// src/services/api.js
import { fetchAuthSession } from 'aws-amplify/auth';

const BASE = process.env.REACT_APP_API_BASE_URL;

async function authHeaders() {
  const session = await fetchAuthSession();
  const token   = session?.tokens?.idToken?.toString();
  if (!token) {
    // Session expired or user is not authenticated — trigger a re-login
    throw new Error("SESSION_EXPIRED");
  }
  return {
    Authorization:  token,
    'Content-Type': 'application/json',
  };
}

export async function getEvents(location, radius = 25) {
  const res = await fetch(`${BASE}/events`, {
    method:  'POST',
    headers: await authHeaders(),
    body:    JSON.stringify({ location, radius }),
  });
  if (!res.ok) throw new Error(`Events fetch failed: ${res.status}`);
  return res.json();
}

export async function getRecommendations(genres, events, artists = []) {
  const res = await fetch(`${BASE}/recommendations`, {
    method:  'POST',
    headers: await authHeaders(),
    body:    JSON.stringify({ genres, artists, events }),
  });
  if (!res.ok) throw new Error(`Recommendations fetch failed: ${res.status}`);
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${BASE}/profile`, {
    method:  'GET',
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  return res.json();
}

export async function saveProfile(data) {
  const res = await fetch(`${BASE}/profile`, {
    method:  'PUT',
    headers: await authHeaders(),
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Profile save failed: ${res.status}`);
  return res.json();
}

export async function saveShow(show) {
  const res = await fetch(`${BASE}/profile/saved`, {
    method:  'POST',
    headers: await authHeaders(),
    body:    JSON.stringify({ show }),
  });
  if (!res.ok) throw new Error(`Save show failed: ${res.status}`);
  return res.json();
}

export async function unsaveShow(eventId) {
  const res = await fetch(`${BASE}/profile/saved/${eventId}`, {
    method:  'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Unsave show failed: ${res.status}`);
  return res.json();
}