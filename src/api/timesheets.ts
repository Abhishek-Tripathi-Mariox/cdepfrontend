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
  const res = await http.get<any>('/timesheets');
  return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
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
  const res = await http.post<any>('/timesheets', payload);
  const data = res.data;
  return (data && typeof data === 'object' && '_id' in data) ? data : data?.data ?? {};
}

export async function fetchProjectRisks(): Promise<ProjectRisk[]> {
  const res = await http.get<any>('/timesheets/risk/projects');
  return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
}

