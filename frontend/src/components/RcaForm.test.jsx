import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { emptyRca } from '../utils/rcaFormData'
import RcaForm from './RcaForm'

function renderForm(onSubmit = vi.fn().mockResolvedValue(true)) {
  render(
    <MemoryRouter>
      <RcaForm initialData={emptyRca()} onSubmit={onSubmit} submitLabel="Save RCA" submitting={false} />
    </MemoryRouter>,
  )
  return onSubmit
}

test('renders all form sections and team groups', () => {
  renderForm()
  expect(screen.getByRole('heading', { name: 'Incident Details' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Release and Impact' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Root Cause Analysis' })).toBeInTheDocument()
  expect(screen.getByText('Development')).toBeInTheDocument()
  expect(screen.getAllByText('Release Management')).toHaveLength(2)
})

test('shows required validation and submits a valid RCA', async () => {
  const user = userEvent.setup()
  const onSubmit = renderForm()

  await user.click(screen.getByRole('button', { name: 'Save RCA' }))
  expect(screen.getByText('Incident number is required')).toBeInTheDocument()
  expect(screen.getByText('Issue description is required')).toBeInTheDocument()
  expect(onSubmit).not.toHaveBeenCalled()

  await user.type(screen.getByLabelText(/Incident Number/), 'INC-900')
  await user.type(screen.getByLabelText(/Issue Description/), 'Production latency spike')
  await user.click(screen.getByRole('button', { name: 'Save RCA' }))

  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
    incidentNumber: 'INC-900',
    issueDescription: 'Production latency spike',
    rcaStatus: 'Open',
  }))
})
