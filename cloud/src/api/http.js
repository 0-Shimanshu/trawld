async function parseJson(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await response.text()
    throw new Error(text || `Unexpected response type: ${contentType}`)
  }

  return response.json()
}

export async function getJson(url) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      accept: 'application/json'
    }
  })

  if (!response.ok) {
    const body = await parseJson(response).catch(() => ({}))
    throw new Error(body?.error || `Request failed: ${response.status}`)
  }

  return parseJson(response)
}

export async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  })

  if (!response.ok) {
    const payload = await parseJson(response).catch(() => ({}))
    throw new Error(payload?.error || `Request failed: ${response.status}`)
  }

  return parseJson(response)
}
