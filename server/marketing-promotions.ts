// ============================================
// MARKETING & PROMOTIONAL TOOLS
// ============================================

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_service';
  value: number;
  description: string;
  maxUsage: number;
  currentUsage: number;
  minOrderValue?: number;
  applicableServices: string[]; // 'all' or specific service types
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  templateId?: string;
  targetAudience: 'all' | 'new_users' | 'inactive_users' | 'high_value' | 'custom';
  segmentId?: string;
  scheduledDate: Date;
  sentDate?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  openRate?: number;
  clickRate?: number;
  conversionRate?: number;
  recipientCount: number;
}

export interface SMSCampaign {
  id: string;
  message: string;
  targetAudience: string;
  scheduledDate: Date;
  sentDate?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipientCount: number;
  deliveredCount?: number;
}

export interface PushNotificationCampaign {
  id: string;
  title: string;
  message: string;
  targetAudience: string;
  scheduledDate: Date;
  sentDate?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipientCount: number;
  deliveredCount?: number;
  clickCount?: number;
}

export interface FlashSale {
  id: string;
  name: string;
  description: string;
  serviceType: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  maxQuantity?: number;
  currentQuantity: number;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  createdAt: Date;
}

export interface SeasonalOffer {
  id: string;
  name: string;
  description: string;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'ramadan' | 'eid';
  discountPercentage: number;
  applicableServices: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface AffiliateProgram {
  id: string;
  affiliateId: string;
  affiliateName: string;
  commissionPercentage: number;
  totalEarnings: number;
  totalReferrals: number;
  status: 'active' | 'suspended' | 'terminated';
  joinDate: Date;
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
  };
}

// ============================================
// COUPON MANAGEMENT
// ============================================

const coupons: Map<string, Coupon> = new Map();

export function createCoupon(
  code: string,
  type: string,
  value: number,
  description: string,
  maxUsage: number,
  applicableServices: string[],
  startDate: Date,
  endDate: Date,
  createdBy: string,
  minOrderValue?: number
): Coupon {
  const coupon: Coupon = {
    id: `coupon_${Date.now()}`,
    code: code.toUpperCase(),
    type: type as any,
    value,
    description,
    maxUsage,
    currentUsage: 0,
    minOrderValue,
    applicableServices,
    startDate,
    endDate,
    isActive: true,
    createdBy,
  };

  coupons.set(coupon.id, coupon);
  return coupon;
}

export function validateCoupon(code: string, orderValue: number, serviceType: string): { valid: boolean; discount: number; message: string } {
  const coupon = Array.from(coupons.values()).find((c) => c.code === code.toUpperCase());

  if (!coupon) {
    return { valid: false, discount: 0, message: 'Coupon not found' };
  }

  if (!coupon.isActive) {
    return { valid: false, discount: 0, message: 'Coupon is inactive' };
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    return { valid: false, discount: 0, message: 'Coupon has expired' };
  }

  if (coupon.currentUsage >= coupon.maxUsage) {
    return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
  }

  if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
    return { valid: false, discount: 0, message: `Minimum order value is ${coupon.minOrderValue}` };
  }

  if (
    coupon.applicableServices.length > 0 &&
    !coupon.applicableServices.includes('all') &&
    !coupon.applicableServices.includes(serviceType)
  ) {
    return { valid: false, discount: 0, message: 'Coupon not applicable to this service' };
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (orderValue * coupon.value) / 100;
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
  }

  coupon.currentUsage++;

  return { valid: true, discount, message: 'Coupon applied successfully' };
}

export function getCoupon(couponId: string): Coupon | null {
  return coupons.get(couponId) || null;
}

export function getActiveCoupons(): Coupon[] {
  const now = new Date();

  return Array.from(coupons.values()).filter(
    (c) => c.isActive && c.startDate <= now && c.endDate >= now && c.currentUsage < c.maxUsage
  );
}

export function deactivateCoupon(couponId: string): Coupon | null {
  const coupon = coupons.get(couponId);
  if (!coupon) return null;

  coupon.isActive = false;
  return coupon;
}

// ============================================
// EMAIL CAMPAIGNS
// ============================================

const emailCampaigns: Map<string, EmailCampaign> = new Map();

export function createEmailCampaign(
  name: string,
  subject: string,
  content: string,
  targetAudience: string,
  scheduledDate: Date,
  recipientCount: number,
  templateId?: string,
  segmentId?: string
): EmailCampaign {
  const campaign: EmailCampaign = {
    id: `email_${Date.now()}`,
    name,
    subject,
    content,
    templateId,
    targetAudience: targetAudience as any,
    segmentId,
    scheduledDate,
    status: 'draft',
    recipientCount,
  };

  emailCampaigns.set(campaign.id, campaign);
  return campaign;
}

export function scheduleEmailCampaign(campaignId: string): EmailCampaign | null {
  const campaign = emailCampaigns.get(campaignId);
  if (!campaign) return null;

  campaign.status = 'scheduled';
  return campaign;
}

export function sendEmailCampaign(campaignId: string): EmailCampaign | null {
  const campaign = emailCampaigns.get(campaignId);
  if (!campaign) return null;

  campaign.status = 'sent';
  campaign.sentDate = new Date();
  campaign.openRate = Math.random() * 30; // Placeholder
  campaign.clickRate = Math.random() * 10;
  campaign.conversionRate = Math.random() * 5;

  return campaign;
}

export function getEmailCampaigns(): EmailCampaign[] {
  return Array.from(emailCampaigns.values());
}

// ============================================
// SMS CAMPAIGNS
// ============================================

const smsCampaigns: Map<string, SMSCampaign> = new Map();

export function createSMSCampaign(
  message: string,
  targetAudience: string,
  scheduledDate: Date,
  recipientCount: number
): SMSCampaign {
  const campaign: SMSCampaign = {
    id: `sms_${Date.now()}`,
    message,
    targetAudience,
    scheduledDate,
    status: 'draft',
    recipientCount,
  };

  smsCampaigns.set(campaign.id, campaign);
  return campaign;
}

export function sendSMSCampaign(campaignId: string): SMSCampaign | null {
  const campaign = smsCampaigns.get(campaignId);
  if (!campaign) return null;

  campaign.status = 'sent';
  campaign.sentDate = new Date();
  campaign.deliveredCount = Math.floor(campaign.recipientCount * 0.95); // 95% delivery rate

  return campaign;
}

// ============================================
// PUSH NOTIFICATION CAMPAIGNS
// ============================================

const pushCampaigns: Map<string, PushNotificationCampaign> = new Map();

export function createPushNotificationCampaign(
  title: string,
  message: string,
  targetAudience: string,
  scheduledDate: Date,
  recipientCount: number
): PushNotificationCampaign {
  const campaign: PushNotificationCampaign = {
    id: `push_${Date.now()}`,
    title,
    message,
    targetAudience,
    scheduledDate,
    status: 'draft',
    recipientCount,
  };

  pushCampaigns.set(campaign.id, campaign);
  return campaign;
}

export function sendPushNotificationCampaign(campaignId: string): PushNotificationCampaign | null {
  const campaign = pushCampaigns.get(campaignId);
  if (!campaign) return null;

  campaign.status = 'sent';
  campaign.sentDate = new Date();
  campaign.deliveredCount = Math.floor(campaign.recipientCount * 0.98);
  campaign.clickCount = Math.floor((campaign.deliveredCount || 0) * 0.15);

  return campaign;
}

// ============================================
// FLASH SALES
// ============================================

const flashSales: Map<string, FlashSale> = new Map();

export function createFlashSale(
  name: string,
  description: string,
  serviceType: string,
  discountPercentage: number,
  startDate: Date,
  endDate: Date,
  maxQuantity?: number
): FlashSale {
  const sale: FlashSale = {
    id: `flash_${Date.now()}`,
    name,
    description,
    serviceType,
    discountPercentage,
    startDate,
    endDate,
    maxQuantity,
    currentQuantity: 0,
    status: 'upcoming',
    createdAt: new Date(),
  };

  flashSales.set(sale.id, sale);
  return sale;
}

export function getActiveFlashSales(): FlashSale[] {
  const now = new Date();

  return Array.from(flashSales.values()).filter((s) => {
    if (s.status === 'cancelled') return false;
    if (now < s.startDate) return false;
    if (now > s.endDate) {
      s.status = 'ended';
      return false;
    }
    if (s.maxQuantity && s.currentQuantity >= s.maxQuantity) return false;

    s.status = 'active';
    return true;
  });
}

// ============================================
// SEASONAL OFFERS
// ============================================

const seasonalOffers: Map<string, SeasonalOffer> = new Map();

export function createSeasonalOffer(
  name: string,
  description: string,
  season: string,
  discountPercentage: number,
  applicableServices: string[],
  startDate: Date,
  endDate: Date
): SeasonalOffer {
  const offer: SeasonalOffer = {
    id: `seasonal_${Date.now()}`,
    name,
    description,
    season: season as any,
    discountPercentage,
    applicableServices,
    startDate,
    endDate,
    isActive: true,
    createdAt: new Date(),
  };

  seasonalOffers.set(offer.id, offer);
  return offer;
}

export function getSeasonalOffers(season?: string): SeasonalOffer[] {
  return Array.from(seasonalOffers.values()).filter((o) => {
    if (!o.isActive) return false;
    if (season && o.season !== season) return false;

    const now = new Date();
    return o.startDate <= now && o.endDate >= now;
  });
}

// ============================================
// AFFILIATE PROGRAM
// ============================================

const affiliatePrograms: Map<string, AffiliateProgram> = new Map();

export function enrollAffiliate(
  affiliateId: string,
  affiliateName: string,
  commissionPercentage: number
): AffiliateProgram {
  const program: AffiliateProgram = {
    id: `affiliate_${Date.now()}`,
    affiliateId,
    affiliateName,
    commissionPercentage,
    totalEarnings: 0,
    totalReferrals: 0,
    status: 'active',
    joinDate: new Date(),
  };

  affiliatePrograms.set(program.id, program);
  return program;
}

export function getAffiliateProgram(affiliateId: string): AffiliateProgram | null {
  return Array.from(affiliatePrograms.values()).find((p) => p.affiliateId === affiliateId) || null;
}

export function recordAffiliateReferral(affiliateId: string, amount: number): AffiliateProgram | null {
  const program = getAffiliateProgram(affiliateId);
  if (!program) return null;

  program.totalReferrals++;
  program.totalEarnings += (amount * program.commissionPercentage) / 100;

  return program;
}

export function getTopAffiliates(limit: number = 10): AffiliateProgram[] {
  return Array.from(affiliatePrograms.values())
    .filter((p) => p.status === 'active')
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, limit);
}

// ============================================
// MARKETING ANALYTICS
// ============================================

export function getMarketingAnalytics() {
  const activeCoupons = getActiveCoupons();
  const activeFlashSales = getActiveFlashSales();
  const activeSeasonalOffers = getSeasonalOffers();
  const emailCampaignsList = Array.from(emailCampaigns.values());
  const sentEmails = emailCampaignsList.filter((c) => c.status === 'sent');

  const totalCouponUsage = activeCoupons.reduce((sum, c) => sum + c.currentUsage, 0);
  const totalCouponDiscount = activeCoupons.reduce((sum, c) => sum + c.value * c.currentUsage, 0);

  const avgEmailOpenRate = sentEmails.length > 0 ? sentEmails.reduce((sum, c) => sum + (c.openRate || 0), 0) / sentEmails.length : 0;

  return {
    activeCoupons: activeCoupons.length,
    activeFlashSales: activeFlashSales.length,
    activeSeasonalOffers: activeSeasonalOffers.length,
    totalCouponUsage,
    totalCouponDiscount,
    emailCampaigns: emailCampaignsList.length,
    sentEmails: sentEmails.length,
    avgEmailOpenRate: Math.round(avgEmailOpenRate * 100) / 100,
    topAffiliates: getTopAffiliates(5),
  };
}
