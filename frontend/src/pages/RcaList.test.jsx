import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import RcaList from './RcaList'

afterEach(() => vi.unstubAllGlobals())

test('loads RCA rows from the backend', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({
      content: [{
        id: 1, incidentNumber: 'INC-501', priority: 'P2', application: 'Payments',
        artTeamName: 'Atlas', rollbackStatus: 'Not Required', rcaStatus: 'Open',
        releaseDatetime: null, createdAt: '2026-10-11T12:00:00',
      }],
      totalElements: 1, totalPages: 1, size: 20,
    }),
  }))

  render(<MemoryRouter><RcaList /></MemoryRouter>)
  expect(await screen.findByRole('link', { name: 'INC-501' })).toBeInTheDocument()
  expect(screen.getByText('Payments')).toBeInTheDocument()
})

test('shows a useful API error when list loading fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  render(<MemoryRouter><RcaList /></MemoryRouter>)
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach RCAHub')
})
