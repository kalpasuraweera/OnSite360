export class DashboardResponseDto {
  // Basic user/project counts
  totalUsers: number;
  adminActivity: number; // number of admin users (replaces "Admin Activity" since activity logs are not available)
  alerts: number; // unread notifications
  activeProjects: number;
  // Progress / value metrics
  avgProgress: number; // average task progress (0-100)
  totalValue: number; // sum of project budgets
  totalExpenses: number; // sum of expense amounts
  outstandingValue: number; // sum of unapproved expense amounts (replaces "Outstanding Value")
  // Team/workforce metrics
  teamMembers: number; // unique users assigned to projects
  efficiency: number; // % of completed tasks across scope
  tasksComplete: number; // count tasks completed
  urgentTasks: number; // tasks with high/critical priority
  activeCrew: number; // active crew assignments
  // RFIs / notifications / approvals
  openRFIs: number;
  notifications: number; // total notifications (or unread)
  approvalsPending: number; // expenses awaiting approval
  // Documents / milestones / hours
  drawingRevisions: number; // documents of type 'Drawing'
  manHoursThisWeek: number; // sum of attendanceRecord.totalHours for current week
  averageExpense: number; // average expense amount (replaces "Average Invoices")
  // Aggregate progress / budget status
  completionRate: number; // overall tasks completion %
  overallProgress: string; // "On Track" | "Delayed"
  budgetStatus: {
    remaining: number;
    status: 'Under' | 'Over' | 'Balanced';
  };
  milestones: number; // number of project phases
}
