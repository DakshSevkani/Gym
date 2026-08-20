export type Role = 'OWNER' | 'TRAINER' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  status: 'Active' | 'Inactive';
  age?: number;
  phone?: string;
  bio?: string;
  fitnessGoal?: string;
  address?: string;
  emergencyContact?: string;
}

export interface AppNotification {
  id: string;
  senderRole: Role;
  senderName: string;
  targetRole: 'ALL' | 'TRAINERS' | 'MEMBERS' | 'SPECIFIC_TRAINER' | 'SPECIFIC_MEMBER';
  recipientId?: string; // Member ID or Trainer ID or User ID
  recipientName?: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'info' | 'alert' | 'success';
}

export interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  tier: 'Basic Monthly' | 'Pro Quarter' | 'VIP Annual';
  status: 'Active' | 'Expired' | 'Pending';
  startDate: string;
  expirationDate: string;
  daysRemaining: number;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  assignedTrainerSpecialty?: string;
  assignedTrainerAvatar?: string;
  assignedTrainerPhone?: string;
  assignedTrainerEmail?: string;
  lastPaymentId?: string;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
  lastPaymentMethod?: string;
}

export interface Trainer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  activeClientsCount: number;
  status: 'Active' | 'On Leave';
}

export interface Payment {
  id: string;
  transactionId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  planName: string;
  method: 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Cash';
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}

export interface DashboardStats {
  totalUsers?: number;
  totalMembers: number;
  totalMembersGrowth: string;
  totalTrainers: number;
  totalTrainersGrowth: string;
  activeMemberships: number;
  activeRate: string;
  totalRevenue: number;
  totalRevenueGrowth: string;
  revenueTrend: { month: string; revenue: number; target: number }[];
  memberGrowthTrend: { month: string; members: number }[];
  recentActivities: { id: string; user: string; action: string; time: string; type: string }[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}
