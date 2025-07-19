export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  location?: string;
  reportedBy: string;
  reportedById?: string;
  dueDate?: Date;
  resolvedAt?: Date;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  reporter?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  taggedUsers?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

export enum IssueStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

export enum IssueSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum IssueCategory {
  SAFETY = 'Safety',
  QUALITY = 'Quality',
  DELAY = 'Delay',
  EQUIPMENT = 'Equipment',
  ENVIRONMENTAL = 'Environmental',
  MATERIAL = 'Material',
  OTHER = 'Other',
}
