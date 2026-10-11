import { render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import Dashboard from './Dashboard'

afterEach(() => vi.unstubAllGlobals())

test('renders dashboard totals returned by the backend', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({
      totalRcas: 14,
      completedRollbacks: 3,
      openRcas: 5,
      inProgressRcas: 4,
      completedRcas: 5,
      byPriority: [{ label: 'P1', count: 2 }],
      byMonth: [{ label: 'October 2026', count: 4 }],
      byApplication: [{ label: 'Payments', count: 6 }],
      byRollbackStatus: [{ label: 'Completed', count: 3 }],
    }),
  }))

  render(<Dashboard />)
  expect(await screen.findByText('14')).toBeInTheDocument()
  expect(screen.getByText('Completed Rollbacks')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'RCA Count by Priority' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Rollback Status Distribution' })).toBeInTheDocument()
})
