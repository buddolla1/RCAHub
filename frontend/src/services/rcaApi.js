const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      ...options,
    })
  } catch {
    throw new Error('Unable to reach RCAHub. Check that the backend is running.')
  }

  if (!response.ok) {
    let error
    try {
      error = await response.json()
    } catch {
      error = null
    }
    const apiError = new Error(error?.message || `Request failed with status ${response.status}`)
    apiError.status = response.status
    apiError.fieldErrors = error?.fieldErrors || {}
    throw apiError
  }

  return response.status === 204 ? null : response.json()
}

export function createRca(payload) {
  return request('/rcas', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchRcas(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) query.set(key, value)
  })
  return request(`/rcas?${query.toString()}`)
}

export function fetchRca(id) {
  return request(`/rcas/${id}`)
}

export function updateRca(id, payload) {
  return request(`/rcas/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteRca(id) {
  return request(`/rcas/${id}`, { method: 'DELETE' })
}

export function fetchDashboardSummary() {
  return request('/dashboard/summary')
}
