export interface ActivityLog {
  id: string;
  type: "session_completed" | "weight_logged" | "new_student";
  studentName: string;
  details?: string;
  timeAgo: string;
}

export interface AlertData {
  id: string;
  studentName: string;
  phone?: string;
  daysLate?: number;
  daysInactive?: number;
}

export interface RecentStudent {
  id: string;
  name: string;
  email: string | null;
  planName: string | null;
  status: "activo" | "inactivo" | "pendiente";
}

export interface DashboardStats {
  activeStudents: number;
  pendingRoutines: number;
  adherenceRate: number;
  monthlyRevenue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  expiringPayments: AlertData[];
  atRiskStudents: AlertData[];
  noPlanStudents: AlertData[];
  recentStudents: RecentStudent[];
  activities: ActivityLog[];
  lastUpdated?: string;
}
