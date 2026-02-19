import { http } from './http';

export type TimesheetStatus = 'pending' | 'approved' | 'rejected';

export type Timesheet = {
  _id: string;
  tenant: string;
  user: string | { _id: string; name: string };
  project: any;
  milestone?: any;
  allocation?: any;
  date: string;
  hours: number;
  description: string;
  blockers?: string;
  status: TimesheetStatus;
};

export type ProjectRiskStatus =
  | 'ok'
  | 'warning'
  | 'critical'
  | 'overrun'
  | 'no_logs'
  | 'deadline_risk';

export type ProjectRisk = {
  projectId: string;
  burnRate: number;
  remaining: number;
  status: ProjectRiskStatus;
};

export async function fetchMyTimesheets(): Promise<Timesheet[]> {
  const res = await http.get<Timesheet[]>('/timesheets');
  return res.data;
}

export async function createTimesheet(payload: {
  project: string;
  milestone?: string;
  allocation?: string;
  date: string;
  hours: number;
  description: string;
  blockers?: string;
}): Promise<Timesheet> {
  const res = await http.post<Timesheet>('/timesheets', payload);
  return res.data;
}

export async function fetchProjectRisks(): Promise<ProjectRisk[]> {
  const res = await http.get<ProjectRisk[]>('/timesheets/risk/projects');
  return res.data;
}

