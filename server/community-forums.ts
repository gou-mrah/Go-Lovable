// ============================================
// COMMUNITY & FORUMS SYSTEM
// ============================================

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  topicCount: number;
  replyCount: number;
  lastActivity: Date;
  moderators: string[];
}

export interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  tags: string[];
  views: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastReplyAt: Date;
}

export interface ForumReply {
  id: string;
  topicId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  isAcceptedAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityMember {
  userId: string;
  userName: string;
  avatar?: string;
  bio?: string;
  joinDate: Date;
  topicsCreated: number;
  repliesCreated: number;
  reputation: number;
  badges: string[];
  isVerified: boolean;
  isModerator: boolean;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  eventType: 'webinar' | 'meetup' | 'workshop' | 'contest';
  startDate: Date;
  endDate: Date;
  location?: string;
  organizer: string;
  attendees: number;
  maxAttendees?: number;
  imageUrl?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

// ============================================
// FORUM CATEGORIES
// ============================================

const forumCategories: Map<string, ForumCategory> = new Map();
const forumTopics: Map<string, ForumTopic> = new Map();
const forumReplies: Map<string, ForumReply> = new Map();
const communityMembers: Map<string, CommunityMember> = new Map();
const communityEvents: Map<string, CommunityEvent> = new Map();

export function createForumCategory(
  name: string,
  description: string,
  icon?: string,
  moderators: string[] = []
): ForumCategory {
  const category: ForumCategory = {
    id: `cat_${Date.now()}`,
    name,
    description,
    icon,
    topicCount: 0,
    replyCount: 0,
    lastActivity: new Date(),
    moderators,
  };

  forumCategories.set(category.id, category);
  return category;
}

export function getForumCategories(): ForumCategory[] {
  return Array.from(forumCategories.values());
}

export function getForumCategory(categoryId: string): ForumCategory | null {
  return forumCategories.get(categoryId) || null;
}

// ============================================
// FORUM TOPICS
// ============================================

export function createForumTopic(
  categoryId: string,
  title: string,
  content: string,
  authorId: string,
  authorName: string,
  tags: string[] = [],
  authorAvatar?: string
): ForumTopic {
  const topic: ForumTopic = {
    id: `topic_${Date.now()}`,
    categoryId,
    title,
    content,
    authorId,
    authorName,
    authorAvatar,
    tags,
    views: 0,
    replyCount: 0,
    isPinned: false,
    isLocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastReplyAt: new Date(),
  };

  forumTopics.set(topic.id, topic);

  // Update category
  const category = forumCategories.get(categoryId);
  if (category) {
    category.topicCount++;
    category.lastActivity = new Date();
  }

  return topic;
}

export function getForumTopic(topicId: string): ForumTopic | null {
  const topic = forumTopics.get(topicId);
  if (topic) {
    topic.views++;
  }
  return topic || null;
}

export function getCategoryTopics(categoryId: string, limit: number = 20): ForumTopic[] {
  return Array.from(forumTopics.values())
    .filter((t) => t.categoryId === categoryId && !t.isLocked)
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.lastReplyAt.getTime() - a.lastReplyAt.getTime();
    })
    .slice(0, limit);
}

export function searchTopics(query: string): ForumTopic[] {
  const lowerQuery = query.toLowerCase();

  return Array.from(forumTopics.values()).filter((t) => {
    return (
      t.title.toLowerCase().includes(lowerQuery) ||
      t.content.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

export function pinTopic(topicId: string): ForumTopic | null {
  const topic = forumTopics.get(topicId);
  if (!topic) return null;

  topic.isPinned = true;
  return topic;
}

export function unpinTopic(topicId: string): ForumTopic | null {
  const topic = forumTopics.get(topicId);
  if (!topic) return null;

  topic.isPinned = false;
  return topic;
}

export function lockTopic(topicId: string): ForumTopic | null {
  const topic = forumTopics.get(topicId);
  if (!topic) return null;

  topic.isLocked = true;
  return topic;
}

export function unlockTopic(topicId: string): ForumTopic | null {
  const topic = forumTopics.get(topicId);
  if (!topic) return null;

  topic.isLocked = false;
  return topic;
}

// ============================================
// FORUM REPLIES
// ============================================

export function createForumReply(
  topicId: string,
  content: string,
  authorId: string,
  authorName: string,
  authorAvatar?: string
): ForumReply {
  const reply: ForumReply = {
    id: `reply_${Date.now()}`,
    topicId,
    content,
    authorId,
    authorName,
    authorAvatar,
    likes: 0,
    isAcceptedAnswer: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  forumReplies.set(reply.id, reply);

  // Update topic
  const topic = forumTopics.get(topicId);
  if (topic) {
    topic.replyCount++;
    topic.lastReplyAt = new Date();
  }

  // Update category
  const category = forumCategories.get(topic?.categoryId || '');
  if (category) {
    category.replyCount++;
  }

  return reply;
}

export function getTopicReplies(topicId: string): ForumReply[] {
  return Array.from(forumReplies.values())
    .filter((r) => r.topicId === topicId)
    .sort((a, b) => {
      if (a.isAcceptedAnswer !== b.isAcceptedAnswer) return a.isAcceptedAnswer ? -1 : 1;
      return b.likes - a.likes;
    });
}

export function likeReply(replyId: string): ForumReply | null {
  const reply = forumReplies.get(replyId);
  if (!reply) return null;

  reply.likes++;
  return reply;
}

export function markAsAcceptedAnswer(replyId: string): ForumReply | null {
  const reply = forumReplies.get(replyId);
  if (!reply) return null;

  reply.isAcceptedAnswer = true;
  return reply;
}

// ============================================
// COMMUNITY MEMBERS
// ============================================

export function registerCommunityMember(
  userId: string,
  userName: string,
  avatar?: string,
  bio?: string
): CommunityMember {
  const member: CommunityMember = {
    userId,
    userName,
    avatar,
    bio,
    joinDate: new Date(),
    topicsCreated: 0,
    repliesCreated: 0,
    reputation: 0,
    badges: [],
    isVerified: false,
    isModerator: false,
  };

  communityMembers.set(userId, member);
  return member;
}

export function getCommunityMember(userId: string): CommunityMember | null {
  return communityMembers.get(userId) || null;
}

export function updateMemberReputation(userId: string, points: number): CommunityMember | null {
  const member = communityMembers.get(userId);
  if (!member) return null;

  member.reputation += points;

  // Award badges
  if (member.reputation >= 100 && !member.badges.includes('Helpful Member')) {
    member.badges.push('Helpful Member');
  }
  if (member.reputation >= 500 && !member.badges.includes('Expert')) {
    member.badges.push('Expert');
  }
  if (member.topicsCreated >= 50 && !member.badges.includes('Active Contributor')) {
    member.badges.push('Active Contributor');
  }

  return member;
}

export function getCommunityLeaderboard(limit: number = 10): CommunityMember[] {
  return Array.from(communityMembers.values())
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, limit);
}

// ============================================
// COMMUNITY EVENTS
// ============================================

export function createCommunityEvent(
  title: string,
  description: string,
  eventType: string,
  startDate: Date,
  endDate: Date,
  organizer: string,
  location?: string,
  imageUrl?: string,
  maxAttendees?: number
): CommunityEvent {
  const event: CommunityEvent = {
    id: `event_${Date.now()}`,
    title,
    description,
    eventType: eventType as any,
    startDate,
    endDate,
    location,
    organizer,
    attendees: 0,
    maxAttendees,
    imageUrl,
    status: 'upcoming',
  };

  communityEvents.set(event.id, event);
  return event;
}

export function getUpcomingEvents(): CommunityEvent[] {
  const now = new Date();

  return Array.from(communityEvents.values())
    .filter((e) => e.startDate > now && e.status !== 'cancelled')
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export function registerForEvent(eventId: string): CommunityEvent | null {
  const event = communityEvents.get(eventId);
  if (!event) return null;

  if (event.maxAttendees && event.attendees >= event.maxAttendees) {
    return null; // Event is full
  }

  event.attendees++;
  return event;
}

export function getCommunityStats() {
  const totalMembers = communityMembers.size;
  const totalTopics = forumTopics.size;
  const totalReplies = forumReplies.size;
  const totalEvents = communityEvents.size;

  const topMembers = getCommunityLeaderboard(5);
  const upcomingEvents = getUpcomingEvents().slice(0, 5);

  return {
    totalMembers,
    totalTopics,
    totalReplies,
    totalEvents,
    topMembers,
    upcomingEvents,
    averageReputation: totalMembers > 0 ? Array.from(communityMembers.values()).reduce((sum, m) => sum + m.reputation, 0) / totalMembers : 0,
  };
}
