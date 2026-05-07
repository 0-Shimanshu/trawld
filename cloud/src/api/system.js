import { getJson, postJson } from './http'

export function getState() {
  return getJson('/state')
}

export function ingestNow() {
  return postJson('/ingest-now')
}

