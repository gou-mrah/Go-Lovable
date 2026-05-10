// ============================================
// REFERRAL & LOYALTY SYSTEM
// ============================================

export interface ReferralProgram {
  id: string;
  referrerId: string;
  refereeId: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'expired';
  commissionPercentage: number;
  commissionAmount: number;
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

export interface LoyaltyAccount {
  userId: string;
  totalPoints: number;
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsThisMonth: number;
  pointsThisYear: number;
  lastPointsUpdate: Date;
  nextTierProgress: number;
  redeemablePoints: number;
  pendingPoints: number;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  discount?: number;
  freeService?: string;
  validUntil: Date;
  usageLimit?: number;
  usageCount: number;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'expire';
  points: number;
  reason: string;
  relatedBookingId?: string;
  timestamp: Date;
  balance: number;
}

// ============================================
// REFERRAL SYSTEM
// ============================================

const referrals: Map<string, ReferralProgram> = new Map();
const referralCodes: Map<string, string> = new Map(); // code -> referrerId

export function generateReferralCode(referrerId: string): string {
  const code = `REF${referrerId.substring(0, 4)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  referralCodes.set(code, referrerId);
  return code;
}

export function createReferral(
  referrerId: string,
  refereeId: string,
  referralCode: string
): ReferralProgram {
  const referral: ReferralProgram = {
    id: `ref_${Date.now()}`,
    referrerId,
    refereeId,
    referralCode,
    status: 'pending',
    commissionPercentage: 10,
    commissionAmount: 0,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  };

  referrals.set(referral.id, referral);
  return referral;
}

export function completeReferral(referralId: string, bookingAmount: number): ReferralProgram | null {
  const referral = referrals.get(referralId);
  if (!referral) return null;

  referral.status = 'completed';
  referral.completedAt = new Date();
  referral.commissionAmount = (bookingAmount * referral.commissionPercentage) / 100;

  referrals.set(referralId, referral);
  return referral;
}

export function getReferralsByReferrer(referrerId: string): ReferralProgram[] {
  return Array.from(referrals.values()).filter((r) => r.referrerId === referrerId);
}

export function getReferralStats(referrerId: string) {
  const userReferrals = getReferralsByReferrer(referrerId);
  const completed = userReferrals.filter((r) => r.status === 'completed');
  const pending = userReferrals.filter((r) => r.status === 'pending');

  return {
    totalReferrals: userReferrals.length,
    completedReferrals: completed.length,
    pendingReferrals: pending.length,
    totalCommission: completed.reduce((sum, r) => sum + r.commissionAmount, 0),
    conversionRate: userReferrals.length > 0 ? (completed.length / userReferrals.length) * 100 : 0,
  };
}

// ============================================
// LOYALTY SYSTEM
// ============================================

const loyaltyAccounts: Map<string, LoyaltyAccount> = new Map();
const loyaltyTransactions: Map<string, LoyaltyTransaction[]> = new Map();
const loyaltyRewards: Map<string, LoyaltyReward> = new Map();

export function initializeLoyaltyAccount(userId: string): LoyaltyAccount {
  const account: LoyaltyAccount = {
    userId,
    totalPoints: 0,
    currentTier: 'bronze',
    pointsThisMonth: 0,
    pointsThisYear: 0,
    lastPointsUpdate: new Date(),
    nextTierProgress: 0,
    redeemablePoints: 0,
    pendingPoints: 0,
  };

  loyaltyAccounts.set(userId, account);
  loyaltyTransactions.set(userId, []);
  return account;
}

export function addLoyaltyPoints(
  userId: string,
  points: number,
  reason: string,
  bookingId?: string
): LoyaltyTransaction {
  let account = loyaltyAccounts.get(userId);
  if (!account) {
    account = initializeLoyaltyAccount(userId);
  }

  // Points are pending for 30 days before becoming redeemable
  account.pendingPoints += points;
  account.pointsThisMonth += points;
  account.pointsThisYear += points;
  account.lastPointsUpdate = new Date();

  // Update tier
  updateLoyaltyTier(account);

  const transaction: LoyaltyTransaction = {
    id: `txn_${Date.now()}`,
    userId,
    type: 'earn',
    points,
    reason,
    relatedBookingId: bookingId,
    timestamp: new Date(),
    balance: account.totalPoints,
  };

  const transactions = loyaltyTransactions.get(userId) || [];
  transactions.push(transaction);
  loyaltyTransactions.set(userId, transactions);

  loyaltyAccounts.set(userId, account);
  return transaction;
}

export function redeemLoyaltyPoints(
  userId: string,
  points: number,
  rewardId: string
): LoyaltyTransaction | null {
  const account = loyaltyAccounts.get(userId);
  if (!account || account.redeemablePoints < points) {
    return null;
  }

  account.redeemablePoints -= points;
  account.totalPoints -= points;

  const transaction: LoyaltyTransaction = {
    id: `txn_${Date.now()}`,
    userId,
    type: 'redeem',
    points: -points,
    reason: `Redeemed reward: ${rewardId}`,
    timestamp: new Date(),
    balance: account.totalPoints,
  };

  const transactions = loyaltyTransactions.get(userId) || [];
  transactions.push(transaction);
  loyaltyTransactions.set(userId, transactions);

  loyaltyAccounts.set(userId, account);
  return transaction;
}

export function updateLoyaltyTier(account: LoyaltyAccount): void {
  const tiers = [
    { tier: 'bronze', minPoints: 0 },
    { tier: 'silver', minPoints: 1000 },
    { tier: 'gold', minPoints: 5000 },
    { tier: 'platinum', minPoints: 10000 },
  ];

  for (let i = tiers.length - 1; i >= 0; i--) {
    if (account.totalPoints >= tiers[i].minPoints) {
      account.currentTier = tiers[i].tier as any;
      const nextTier = tiers[i + 1];
      if (nextTier) {
        account.nextTierProgress = (account.totalPoints - tiers[i].minPoints) / (nextTier.minPoints - tiers[i].minPoints);
      } else {
        account.nextTierProgress = 100;
      }
      break;
    }
  }
}

export function getLoyaltyAccount(userId: string): LoyaltyAccount | null {
  return loyaltyAccounts.get(userId) || null;
}

export function getLoyaltyTransactions(userId: string): LoyaltyTransaction[] {
  return loyaltyTransactions.get(userId) || [];
}

export function createLoyaltyReward(reward: Omit<LoyaltyReward, 'id' | 'usageCount'>): LoyaltyReward {
  const newReward: LoyaltyReward = {
    ...reward,
    id: `reward_${Date.now()}`,
    usageCount: 0,
  };

  loyaltyRewards.set(newReward.id, newReward);
  return newReward;
}

export function getAvailableRewards(userPoints: number): LoyaltyReward[] {
  return Array.from(loyaltyRewards.values()).filter(
    (r) => r.pointsRequired <= userPoints && r.validUntil > new Date()
  );
}

export function getTierBenefits(tier: string): Record<string, any> {
  const benefits: Record<string, any> = {
    bronze: {
      discountPercentage: 5,
      pointsMultiplier: 1,
      prioritySupport: false,
      freeShipping: false,
    },
    silver: {
      discountPercentage: 10,
      pointsMultiplier: 1.25,
      prioritySupport: true,
      freeShipping: false,
    },
    gold: {
      discountPercentage: 15,
      pointsMultiplier: 1.5,
      prioritySupport: true,
      freeShipping: true,
    },
    platinum: {
      discountPercentage: 20,
      pointsMultiplier: 2,
      prioritySupport: true,
      freeShipping: true,
      dedicatedAccountManager: true,
    },
  };

  return benefits[tier] || benefits.bronze;
}

// ============================================
// POINTS CALCULATION
// ============================================

export function calculateBookingPoints(bookingAmount: number, tier: string): number {
  const basePoints = Math.floor(bookingAmount / 10); // 1 point per $10
  const multiplier = getTierBenefits(tier).pointsMultiplier || 1;
  return Math.floor(basePoints * multiplier);
}

export function calculateTierDiscount(amount: number, tier: string): number {
  const discountPercentage = getTierBenefits(tier).discountPercentage || 0;
  return (amount * discountPercentage) / 100;
}

// ============================================
// LOYALTY REPORTS
// ============================================

export function getLoyaltyReport(startDate: Date, endDate: Date) {
  const accounts = Array.from(loyaltyAccounts.values());

  const tierDistribution = {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
  };

  accounts.forEach((acc) => {
    tierDistribution[acc.currentTier]++;
  });

  const totalPoints = accounts.reduce((sum, acc) => sum + acc.totalPoints, 0);
  const totalRedeemable = accounts.reduce((sum, acc) => sum + acc.redeemablePoints, 0);
  const averagePointsPerUser = accounts.length > 0 ? totalPoints / accounts.length : 0;

  return {
    totalUsers: accounts.length,
    tierDistribution,
    totalPoints,
    totalRedeemable,
    averagePointsPerUser,
    topSpenders: accounts
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10)
      .map((acc) => ({
        userId: acc.userId,
        points: acc.totalPoints,
        tier: acc.currentTier,
      })),
  };
}
