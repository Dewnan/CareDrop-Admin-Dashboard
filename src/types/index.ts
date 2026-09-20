// Core domain models and type definitions for CareDrop Admin

export type UserRole = 'patient' | 'guardian' | 'helper' | 'admin' | 'superadmin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type HelperStatus = 'online' | 'offline' | 'suspended';
export type HelperVerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface User {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  type: UserRole;
  phone: string;
  email: string;
  joinedDate: string;
  status: UserStatus;
  tasksCount: number;
  icNumber?: string;
  dateOfBirth?: string;
  address?: string;
  totalSpent?: number;
}

export interface Helper {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  phone: string;
  email: string;
  tasksCount: number;
  rating: number;
  earnings: number;
  status: HelperStatus;
  verificationStatus?: HelperVerificationStatus;
  latitude?: number;
  longitude?: number;
  submittedAt?: string;
}


export type TaskCategory = 'Medication Pickup' | 'Document Filing' | 'Queue Management' | 'Home Assistance' | 'Transport Support' | 'Emergency Review';

export type TaskProgressStep = 
  | 'pending'
  | 'taskAccepted'
  | 'enRoute'
  | 'arrivedAtLocation'
  | 'inProgress'
  | 'uploadProof'
  | 'completed'
  | 'cancelled';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  patientName: string;
  patientId: string;
  helperName?: string;
  helperId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  amount: number;
  status: TaskProgressStep;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  scheduledTime?: string;
  proofImageUrl?: string;
}

export type PaymentMethod = 'COD' | 'Escrow Online' | 'Bank Transfer';
export type PaymentStatus = 'pending' | 'held_escrow' | 'completed' | 'refunded' | 'payout_disbursed';

export interface Transaction {
  id: string;
  taskId: string;
  patientName: string;
  helperName: string;
  grossAmount: number;
  platformFee: number;
  netHelperEarnings: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  disbursedAt?: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'in_review' | 'resolved' | 'closed';
export type TicketCategory = 'Payment & Billing' | 'Task Dispute' | 'Account Issues' | 'Technical Bug' | 'General Inquiry';

export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  category: TicketCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  adminResponse?: string;
  messages?: TicketMessage[];
  resolvedAt?: string;
}

export interface ActivityLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'suspension' | 'verification' | 'refund' | 'payout' | 'ticket' | 'settings';
}

export interface OverviewMetrics {
  totalUsers: number;
  totalUsersTrend: string;
  activeHelpers: number;
  onlineHelpersCount: number;
  pendingVerifications: number;
  urgentVerificationsCount: number;
  activeTasks: number;
  completedTasks: number;
  pendingTasksCount: number;
  cancelledTasksCount: number;
  totalTasksCount: number;
  totalTransactions: string;
  totalRevenueVal: number;
  todayRevenueVal: number;
  pendingDisputes: number;
  escalatedDisputesCount: number;
  supportTickets: number;
  unresolvedTicketsCount: number;
  avgRating: number;
  todayRevenue: string;
  revenueTrend: string;
}

// Represents a granted admin account record stored in Firestore
export interface AdminRecord {
  id: string;
  email: string;
  name: string;
  addedAt: string;
  role?: UserRole;
}
