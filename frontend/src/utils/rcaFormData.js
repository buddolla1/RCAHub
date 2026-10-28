export const TEAM_NAMES = ['Dev', 'QA', 'RTS', 'Program Management', 'Release Management']

export const TEAM_LABELS = {
  Dev: 'Development',
  QA: 'Quality Assurance',
  RTS: 'RTS',
  'Program Management': 'Program Manager',
  'Release Management': 'Release Mgmt',
}

export const ROOT_CAUSE_ISSUES = [
  'Configuration Issue',
  'Code Issue',
  'Environment Issue',
  'Inadequate Testing',
  'Requirement Gap',
  'Missed Pre-Deployment Verification',
  'Impact Analysis',
  'DB Performance Issue',
  'Infrastructure Changes',
  'Application Code Release',
  'DB Changes',
]

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const emptyRca = () => ({
  rcaCategory: '',
  portfolioName: '',
  detectionPointDetail: '',
  impactedSystems: '',
  resolution: '',
  rootCauseIssues: [],
  rootCauseOtherDetail: '',
  reviewType: '',
  serialNumber: '',
  incidentMonth: '',
  incidentYear: new Date().getFullYear().toString(),
  incidentNumber: '',
  changeTicket: '',
  priority: '',
  tower: '',
  application: '',
  programManager: '',
  artTeamName: '',
  issueDescription: '',
  releaseDatetime: '',
  rollbackStatus: 'Not Required',
  incidentStartTime: '',
  incidentEndTime: '',
  impactedSystem: '',
  businessImpact: '',
  rootCause: '',
  rcaType: '',
  remedyUsed: '',
  detectionPoint: '',
  preventiveActions: '',
  rcaStatus: 'Open',
  teamActions: TEAM_NAMES.map((teamName) => ({
    teamName,
    learnings: '',
    correctiveActions: '',
    ticketNumber: '',
    targetCompletionDate: '',
  })),
})

export function fromApiRca(rca) {
  const sourceActions = new Map((rca.teamActions || []).map((action) => [action.teamName, action]))
  return {
    ...emptyRca(),
    ...rca,
    serialNumber: rca.serialNumber?.toString() || '',
    incidentMonth: rca.incidentMonth?.toString() || '',
    incidentYear: rca.incidentYear?.toString() || '',
    releaseDatetime: rca.releaseDatetime?.slice(0, 16) || '',
    incidentStartTime: rca.incidentStartTime?.slice(0, 16) || '',
    incidentEndTime: rca.incidentEndTime?.slice(0, 16) || '',
    rcaCategory: rca.rcaCategory || '',
    portfolioName: rca.portfolioName || '',
    detectionPointDetail: rca.detectionPointDetail || '',
    impactedSystems: rca.impactedSystems || '',
    resolution: rca.resolution || '',
    rootCauseIssues: rca.rootCauseIssues || [],
    rootCauseOtherDetail: rca.rootCauseOtherDetail || '',
    reviewType: rca.reviewType || '',
    teamActions: TEAM_NAMES.map((teamName) => ({
      teamName,
      learnings: sourceActions.get(teamName)?.learnings || '',
      correctiveActions: sourceActions.get(teamName)?.correctiveActions || '',
      ticketNumber: sourceActions.get(teamName)?.ticketNumber || '',
      targetCompletionDate: sourceActions.get(teamName)?.targetCompletionDate || '',
    })),
  }
}

export function toApiPayload(form) {
  const nullable = (value) => value === '' ? null : value
  return {
    ...form,
    serialNumber: form.serialNumber ? Number(form.serialNumber) : null,
    incidentMonth: form.incidentMonth ? Number(form.incidentMonth) : null,
    incidentYear: form.incidentYear ? Number(form.incidentYear) : null,
    releaseDatetime: nullable(form.releaseDatetime),
    incidentStartTime: nullable(form.incidentStartTime),
    incidentEndTime: nullable(form.incidentEndTime),
    priority: nullable(form.priority),
    rcaType: nullable(form.rcaType),
    detectionPoint: nullable(form.detectionPoint),
    rootCauseIssues: form.rootCauseIssues,
    reviewType: nullable(form.reviewType),
    teamActions: form.teamActions.map((action) => ({
      ...action,
      targetCompletionDate: nullable(action.targetCompletionDate),
    })),
  }
}
