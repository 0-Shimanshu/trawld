import { getJson, postJson } from './http'

export function getState() {
  return getJson('/state')
}

export function getSystemInfo() {
  return getJson('/api/system/info')
}

export function ingestNow() {
  return postJson('/ingest-now')
}
