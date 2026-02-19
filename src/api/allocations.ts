import { http } from './http';

export type AllocationStatus = 'planned' | 'active' | 'completed' | 'cancelled';

export type Allocation = {
  _id: string;
  tenant: string;
  project: any;
  developer: any;
  allocatedHours: number;
  consumedHours: number;
  remainingHours: number;
  startDate: string;
  endDate: string;
  role: string;
  dailyCapacityPct: number;
  status: AllocationStatus;
};

export async function fetchAllocations(): Promise<Allocation[]> {
  const res = await http.get<Allocation[]>('/allocations');
  return res.data;
}

