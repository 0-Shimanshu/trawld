import { getJson, postJson } from './http'

export function getCurrentUser() {
  return getJson('/api/auth/me')
}

export function login(password) {
  return postJson('/api/auth/login', { password })
}

export function logout() {
  return postJson('/api/auth/logout')
}

