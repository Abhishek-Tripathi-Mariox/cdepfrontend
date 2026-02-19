import { http } from './http';

// Types mirror backend Project model
export type ProjectStatus = 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export type Project = {
  _id: string;
  tenant: string;
  client: {
    _id: string;
    name: string;
  } | string;
  name: string;
  code: string;
  pm: {
    _id: string;
    name: string;
  } | string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
};

export async function fetchProjects(): Promise<Project[]> {
  const res = await http.get<any>('/projects');
  return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
}

