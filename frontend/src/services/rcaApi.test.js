import { beforeEach, expect, test, vi } from 'vitest'
import { createRca, updateRca } from './rcaApi'

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({ id: 1, incidentNumber: 'INC-1' }),
  })
})

test('creates an RCA through the centralized API client', async () => {
  await createRca({ incidentNumber: 'INC-1' })
  expect(fetch).toHaveBeenCalledWith(
    '/api/v1/rcas',
    expect.objectContaining({ method: 'POST', body: '{"incidentNumber":"INC-1"}' }),
  )
})

test('updates an RCA through the centralized API client', async () => {
  await updateRca(9, { rcaStatus: 'Completed' })
  expect(fetch).toHaveBeenCalledWith(
    '/api/v1/rcas/9',
    expect.objectContaining({ method: 'PUT', body: '{"rcaStatus":"Completed"}' }),
  )
})
