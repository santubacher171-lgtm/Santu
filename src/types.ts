export interface UserProfile {
  uid: string;
  email: string;
  coins: number;
  tasksCompleted: number;
  totalWithdrawn: number;
  role: 'user' | 'admin';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  duration: number;
  url: string;
  type: 'video' | 'link';
  active: boolean;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amountCoins: number;
  amountUSD: number;
  method: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}
