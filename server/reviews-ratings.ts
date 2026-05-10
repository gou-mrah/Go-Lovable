// ============================================
// REVIEWS & RATINGS SYSTEM
// ============================================

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  serviceType: 'hotel' | 'flight' | 'package' | 'tour' | 'guide';
  serviceId: string;
  serviceName: string;
  rating: number; // 1-5
  title: string;
  content: string;
  photos?: string[];
  verified: boolean; // Verified purchase
  helpful: number; // Helpful votes
  unhelpful: number; // Unhelpful votes
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  response?: ReviewResponse;
}

export interface ReviewResponse {
  id: string;
  responderId: string;
  responderName: string;
  content: string;
  createdAt: Date;
}

export interface ReviewSummary {
  serviceId: string;
  serviceName: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>; // 1-5 stars
  verifiedReviews: number;
  recentReviews: Review[];
  topReviews: Review[];
}

export interface ReviewerProfile {
  userId: string;
  userName: string;
  totalReviews: number;
  averageRating: number;
  helpfulVotes: number;
  badges: string[];
  joinDate: Date;
}

// ============================================
// REVIEW MANAGEMENT
// ============================================

const reviews: Map<string, Review> = new Map();
const serviceReviews: Map<string, string[]> = new Map(); // serviceId -> reviewIds
const userReviews: Map<string, string[]> = new Map(); // userId -> reviewIds

export function createReview(
  userId: string,
  userName: string,
  serviceType: string,
  serviceId: string,
  serviceName: string,
  rating: number,
  title: string,
  content: string,
  verified: boolean = false,
  photos?: string[]
): Review {
  const review: Review = {
    id: `review_${Date.now()}`,
    userId,
    userName,
    serviceType: serviceType as any,
    serviceId,
    serviceName,
    rating: Math.min(5, Math.max(1, rating)),
    title,
    content,
    photos,
    verified,
    helpful: 0,
    unhelpful: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'pending', // Requires moderation
  };

  reviews.set(review.id, review);

  // Add to service reviews
  const srvReviews = serviceReviews.get(serviceId) || [];
  srvReviews.push(review.id);
  serviceReviews.set(serviceId, srvReviews);

  // Add to user reviews
  const usrReviews = userReviews.get(userId) || [];
  usrReviews.push(review.id);
  userReviews.set(userId, usrReviews);

  return review;
}

export function approveReview(reviewId: string): Review | null {
  const review = reviews.get(reviewId);
  if (!review) return null;

  review.status = 'approved';
  review.updatedAt = new Date();

  reviews.set(reviewId, review);
  return review;
}

export function rejectReview(reviewId: string): Review | null {
  const review = reviews.get(reviewId);
  if (!review) return null;

  review.status = 'rejected';
  review.updatedAt = new Date();

  reviews.set(reviewId, review);
  return review;
}

export function updateReview(
  reviewId: string,
  rating?: number,
  title?: string,
  content?: string
): Review | null {
  const review = reviews.get(reviewId);
  if (!review) return null;

  if (rating !== undefined) review.rating = Math.min(5, Math.max(1, rating));
  if (title !== undefined) review.title = title;
  if (content !== undefined) review.content = content;

  review.updatedAt = new Date();

  reviews.set(reviewId, review);
  return review;
}

export function deleteReview(reviewId: string): boolean {
  const review = reviews.get(reviewId);
  if (!review) return false;

  // Remove from service reviews
  const srvReviews = serviceReviews.get(review.serviceId) || [];
  const srvIndex = srvReviews.indexOf(reviewId);
  if (srvIndex > -1) srvReviews.splice(srvIndex, 1);

  // Remove from user reviews
  const usrReviews = userReviews.get(review.userId) || [];
  const usrIndex = usrReviews.indexOf(reviewId);
  if (usrIndex > -1) usrReviews.splice(usrIndex, 1);

  reviews.delete(reviewId);
  return true;
}

export function getReview(reviewId: string): Review | null {
  return reviews.get(reviewId) || null;
}

export function getServiceReviews(serviceId: string, status: string = 'approved'): Review[] {
  const reviewIds = serviceReviews.get(serviceId) || [];

  return reviewIds
    .map((id) => reviews.get(id))
    .filter((r) => r && r.status === status) as Review[];
}

export function getUserReviews(userId: string): Review[] {
  const reviewIds = userReviews.get(userId) || [];

  return reviewIds.map((id) => reviews.get(id)).filter((r) => r) as Review[];
}

// ============================================
// REVIEW VOTING
// ============================================

export function markHelpful(reviewId: string): Review | null {
  const review = reviews.get(reviewId);
  if (!review) return null;

  review.helpful++;
  reviews.set(reviewId, review);

  return review;
}

export function markUnhelpful(reviewId: string): Review | null {
  const review = reviews.get(reviewId);
  if (!review) return null;

  review.unhelpful++;
  reviews.set(reviewId, review);

  return review;
}

export function getHelpfulnessScore(reviewId: string): number {
  const review = reviews.get(reviewId);
  if (!review) return 0;

  const total = review.helpful + review.unhelpful;
  if (total === 0) return 0;

  return (review.helpful / total) * 100;
}

// ============================================
// REVIEW RESPONSES
// ============================================

export function addReviewResponse(
  reviewId: string,
  responderId: string,
  responderName: string,
  content: string
): Review | null {
  const review = reviews.get(reviewId);
  if (!review) return null;

  review.response = {
    id: `resp_${Date.now()}`,
    responderId,
    responderName,
    content,
    createdAt: new Date(),
  };

  reviews.set(reviewId, review);
  return review;
}

export function deleteReviewResponse(reviewId: string): Review | null {
  const review = reviews.get(reviewId);
  if (!review) return null;

  review.response = undefined;
  reviews.set(reviewId, review);

  return review;
}

// ============================================
// REVIEW ANALYTICS
// ============================================

export function getReviewSummary(serviceId: string): ReviewSummary {
  const serviceReviewList = getServiceReviews(serviceId, 'approved');

  if (serviceReviewList.length === 0) {
    return {
      serviceId,
      serviceName: '',
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      verifiedReviews: 0,
      recentReviews: [],
      topReviews: [],
    };
  }

  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;
  let verifiedCount = 0;

  serviceReviewList.forEach((review) => {
    ratingDistribution[review.rating]++;
    totalRating += review.rating;
    if (review.verified) verifiedCount++;
  });

  const averageRating = totalRating / serviceReviewList.length;

  const sortedByDate = [...serviceReviewList].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const sortedByHelpful = [...serviceReviewList].sort((a, b) => {
    const scoreA = getHelpfulnessScore(a.id);
    const scoreB = getHelpfulnessScore(b.id);
    return scoreB - scoreA;
  });

  return {
    serviceId,
    serviceName: serviceReviewList[0].serviceName,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: serviceReviewList.length,
    ratingDistribution,
    verifiedReviews: verifiedCount,
    recentReviews: sortedByDate.slice(0, 5),
    topReviews: sortedByHelpful.slice(0, 5),
  };
}

export function getReviewerProfile(userId: string): ReviewerProfile {
  const userReviewList = getUserReviews(userId);

  if (userReviewList.length === 0) {
    return {
      userId,
      userName: '',
      totalReviews: 0,
      averageRating: 0,
      helpfulVotes: 0,
      badges: [],
      joinDate: new Date(),
    };
  }

  const totalRating = userReviewList.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / userReviewList.length;
  const helpfulVotes = userReviewList.reduce((sum, r) => sum + r.helpful, 0);

  const badges = [];
  if (userReviewList.length >= 10) badges.push('Verified Reviewer');
  if (averageRating >= 4.5) badges.push('Quality Reviewer');
  if (helpfulVotes >= 50) badges.push('Helpful Reviewer');

  return {
    userId,
    userName: userReviewList[0].userName,
    totalReviews: userReviewList.length,
    averageRating: Math.round(averageRating * 10) / 10,
    helpfulVotes,
    badges,
    joinDate: userReviewList[0].createdAt,
  };
}

// ============================================
// REVIEW MODERATION
// ============================================

export function getPendingReviews(): Review[] {
  return Array.from(reviews.values()).filter((r) => r.status === 'pending');
}

export function flagReviewAsInappropriate(reviewId: string, reason: string): boolean {
  const review = reviews.get(reviewId);
  if (!review) return false;

  // TODO: Add to moderation queue
  review.status = 'pending';
  reviews.set(reviewId, review);

  return true;
}

export function getReviewsForModeration(limit: number = 10): Review[] {
  return getPendingReviews().slice(0, limit);
}

// ============================================
// REVIEW STATISTICS
// ============================================

export function getReviewStatistics(startDate: Date, endDate: Date) {
  const allReviews = Array.from(reviews.values()).filter(
    (r) => r.createdAt >= startDate && r.createdAt <= endDate && r.status === 'approved'
  );

  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const serviceTypeDistribution: Record<string, number> = {};

  allReviews.forEach((review) => {
    ratingDistribution[review.rating]++;
    serviceTypeDistribution[review.serviceType] = (serviceTypeDistribution[review.serviceType] || 0) + 1;
  });

  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

  return {
    totalReviews: allReviews.length,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution,
    serviceTypeDistribution,
    verifiedReviews: allReviews.filter((r) => r.verified).length,
    reviewsWithPhotos: allReviews.filter((r) => r.photos && r.photos.length > 0).length,
    reviewsWithResponses: allReviews.filter((r) => r.response).length,
  };
}
