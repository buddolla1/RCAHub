import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { emptyRca } from '../utils/rcaFormData'
import RcaForm from './RcaForm'

function validRca() {
  return {
    ...emptyRca(),
    rcaCategory: 'Incident',
    incidentNumber: 'INC-900',
    application: 'Consumer App',
    portfolioName: 'ABO',
    artTeamName: 'Team Alpha',
    programManager: 'Jordan Doe',
    changeTicket: 'CHG-900',
    incidentStartTime: '2026-10-20T10:00',
    incidentEndTime: '2026-10-20T11:00',
    priority: 'P1',
    detectionPoint: 'Monitoring',
    impactedSystems: 'Consumer API',
    issueDescription: 'Production latency spike',
    businessImpact: 'Customers experienced delays',
    resolution: 'Rolled back the release',
    rootCauseIssues: ['Code Issue'],
    rcaStatus: 'Open',
    teamActions: emptyRca().teamActions.map((action) => ({
      ...action,
      learnings: 'NA',
      correctiveActions: 'NA',
    })),
  }
}

function renderForm(initialData = emptyRca(), onSubmit = vi.fn().mockResolvedValue(true)) {
  render(
    <MemoryRouter>
      <RcaForm initialData={initialData} onSubmit={onSubmit} submitLabel="Save RCA" submitting={false} />
    </MemoryRouter>,
  )
  return onSubmit
}

test('renders the requested sections and all five team groups', () => {
  renderForm()
  expect(screen.getByRole('heading', { name: 'RCA Category & Incident Details' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'RCA Detail' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Team-Specific Learnings & Corrective Actions' })).toBeInTheDocument()
  expect(screen.getByText('Development')).toBeInTheDocument()
  expect(screen.getByText('Program Manager', { selector: 'summary span' })).toBeInTheDocument()
  expect(screen.getByText('Release Mgmt')).toBeInTheDocument()
})

test('shows conditional incident, detection, and review fields', async () => {
  const user = userEvent.setup()
  renderForm()

  expect(screen.queryByLabelText(/Incident Number/)).not.toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText(/RCA Category/), 'Incident')
  expect(screen.getByLabelText(/Incident Number/)).toBeInTheDocument()

  await user.selectOptions(screen.getByLabelText(/Detection Point/), 'Other')
  expect(screen.getByLabelText(/Detection Point Detail/)).toBeInTheDocument()

  await user.selectOptions(screen.getByLabelText(/RCA Status/), 'Pending Review')
  expect(screen.getByLabelText(/Review Type/)).toBeInTheDocument()
})

test('collects another root cause category and leaves its checkbox unchecked', async () => {
  const user = userEvent.setup()
  renderForm()

  const otherCategory = screen.getByRole('checkbox', { name: 'Any Other Category' })
  await user.click(otherCategory)
  expect(screen.getByRole('dialog', { name: 'Other category details' })).toBeInTheDocument()

  await user.type(screen.getByLabelText(/Describe the category/), 'Vendor certificate renewal gap')
  await user.click(screen.getByRole('button', { name: 'Submit Details' }))

  expect(otherCategory).not.toBeChecked()
  expect(screen.getByRole('status')).toHaveTextContent('closure workflow has been triggered')
})

test('blocks incomplete data and submits a complete RCA', async () => {
  const user = userEvent.setup()
  const incompleteSubmit = renderForm()

  await user.click(screen.getByRole('button', { name: 'Save RCA' }))
  expect(screen.getByText('RCA category is required')).toBeInTheDocument()
  expect(screen.getByText('Issue description is required')).toBeInTheDocument()
  expect(incompleteSubmit).not.toHaveBeenCalled()

  const onSubmit = vi.fn().mockResolvedValue(true)
  renderForm(validRca(), onSubmit)
  await user.click(screen.getAllByRole('button', { name: 'Save RCA' })[1])

  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
    rcaCategory: 'Incident',
    incidentNumber: 'INC-900',
    rootCauseIssues: ['Code Issue'],
  }))
})
