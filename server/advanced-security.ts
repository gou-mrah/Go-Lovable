// ============================================
// ADVANCED SECURITY FEATURES
// ============================================

export interface TwoFactorAuth {
  userId: string;
  method: 'email' | 'sms' | 'authenticator';
  isEnabled: boolean;
  backupCodes: string[];
  lastUsed?: Date;
}

export interface BiometricAuth {
  userId: string;
  fingerprints: string[];
  faceId?: string;
  isEnabled: boolean;
}

export interface SecurityAuditLog {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'success' | 'failed';
  details?: Record<string, any>;
}

export interface FraudDetection {
  id: string;
  userId: string;
  transactionId: string;
  riskScore: number; // 0-100
  flags: string[];
  status: 'approved' | 'flagged' | 'blocked';
  timestamp: Date;
}

export interface IPWhitelist {
  userId: string;
  ipAddresses: string[];
  isEnabled: boolean;
}

export interface AccountLockout {
  userId: string;
  failedAttempts: number;
  lockedUntil?: Date;
  reason: string;
}

// ============================================
// TWO-FACTOR AUTHENTICATION
// ============================================

const twoFactorAccounts: Map<string, TwoFactorAuth> = new Map();

export function enableTwoFactorAuth(userId: string, method: string): TwoFactorAuth {
  const backupCodes = generateBackupCodes(10);

  const twoFactor: TwoFactorAuth = {
    userId,
    method: method as any,
    isEnabled: true,
    backupCodes,
  };

  twoFactorAccounts.set(userId, twoFactor);
  return twoFactor;
}

export function disableTwoFactorAuth(userId: string): boolean {
  const twoFactor = twoFactorAccounts.get(userId);
  if (!twoFactor) return false;

  twoFactor.isEnabled = false;
  return true;
}

export function verifyTwoFactorCode(userId: string, code: string): boolean {
  const twoFactor = twoFactorAccounts.get(userId);
  if (!twoFactor || !twoFactor.isEnabled) return false;

  // TODO: Verify code based on method (TOTP, SMS, Email)
  // This is a placeholder
  if (twoFactor.backupCodes.includes(code)) {
    // Remove used backup code
    twoFactor.backupCodes = twoFactor.backupCodes.filter((c) => c !== code);
    twoFactor.lastUsed = new Date();
    return true;
  }

  return false;
}

export function generateBackupCodes(count: number): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }

  return codes;
}

export function getTwoFactorAuth(userId: string): TwoFactorAuth | null {
  return twoFactorAccounts.get(userId) || null;
}

// ============================================
// BIOMETRIC AUTHENTICATION
// ============================================

const biometricAccounts: Map<string, BiometricAuth> = new Map();

export function enableBiometricAuth(userId: string): BiometricAuth {
  const biometric: BiometricAuth = {
    userId,
    fingerprints: [],
    isEnabled: true,
  };

  biometricAccounts.set(userId, biometric);
  return biometric;
}

export function addFingerprint(userId: string, fingerprintData: string): BiometricAuth | null {
  const biometric = biometricAccounts.get(userId);
  if (!biometric) return null;

  biometric.fingerprints.push(fingerprintData);
  return biometric;
}

export function addFaceId(userId: string, faceIdData: string): BiometricAuth | null {
  const biometric = biometricAccounts.get(userId);
  if (!biometric) return null;

  biometric.faceId = faceIdData;
  return biometric;
}

export function verifyBiometric(userId: string, biometricData: string, type: 'fingerprint' | 'face'): boolean {
  const biometric = biometricAccounts.get(userId);
  if (!biometric || !biometric.isEnabled) return false;

  if (type === 'fingerprint') {
    return biometric.fingerprints.some((fp) => fp === biometricData);
  } else if (type === 'face') {
    return biometric.faceId === biometricData;
  }

  return false;
}

// ============================================
// SECURITY AUDIT LOGGING
// ============================================

const auditLogs: Map<string, SecurityAuditLog[]> = new Map();

export function logSecurityEvent(
  userId: string,
  action: string,
  ipAddress: string,
  userAgent: string,
  status: 'success' | 'failed',
  details?: Record<string, any>
): SecurityAuditLog {
  const log: SecurityAuditLog = {
    id: `audit_${Date.now()}`,
    userId,
    action,
    ipAddress,
    userAgent,
    timestamp: new Date(),
    status,
    details,
  };

  const userLogs = auditLogs.get(userId) || [];
  userLogs.push(log);
  auditLogs.set(userId, userLogs);

  return log;
}

export function getUserAuditLogs(userId: string, limit: number = 50): SecurityAuditLog[] {
  const userLogs = auditLogs.get(userId) || [];

  return userLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}

export function getAuditLogsByAction(action: string, limit: number = 100): SecurityAuditLog[] {
  const allLogs = Array.from(auditLogs.values()).flat();

  return allLogs
    .filter((log) => log.action === action)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

// ============================================
// FRAUD DETECTION
// ============================================

const fraudDetections: Map<string, FraudDetection> = new Map();

export function analyzeFraudRisk(
  userId: string,
  transactionId: string,
  transactionData: Record<string, any>
): FraudDetection {
  let riskScore = 0;
  const flags: string[] = [];

  // Check for unusual location
  if (transactionData.location && transactionData.previousLocation) {
    if (transactionData.location !== transactionData.previousLocation) {
      riskScore += 15;
      flags.push('Location change detected');
    }
  }

  // Check for unusual amount
  if (transactionData.amount && transactionData.averageAmount) {
    if (transactionData.amount > transactionData.averageAmount * 3) {
      riskScore += 20;
      flags.push('Unusually high transaction amount');
    }
  }

  // Check for rapid transactions
  if (transactionData.timeSinceLastTransaction && transactionData.timeSinceLastTransaction < 60000) {
    riskScore += 10;
    flags.push('Rapid transaction detected');
  }

  // Check for multiple failed attempts
  if (transactionData.failedAttempts && transactionData.failedAttempts > 3) {
    riskScore += 25;
    flags.push('Multiple failed attempts');
  }

  // Check for new device
  if (transactionData.isNewDevice) {
    riskScore += 15;
    flags.push('New device detected');
  }

  // Check for VPN/Proxy
  if (transactionData.isVPN) {
    riskScore += 10;
    flags.push('VPN/Proxy detected');
  }

  let status: 'approved' | 'flagged' | 'blocked' = 'approved';
  if (riskScore >= 70) {
    status = 'blocked';
  } else if (riskScore >= 40) {
    status = 'flagged';
  }

  const detection: FraudDetection = {
    id: `fraud_${Date.now()}`,
    userId,
    transactionId,
    riskScore: Math.min(100, riskScore),
    flags,
    status,
    timestamp: new Date(),
  };

  fraudDetections.set(detection.id, detection);
  return detection;
}

export function getFraudDetection(detectionId: string): FraudDetection | null {
  return fraudDetections.get(detectionId) || null;
}

export function getUserFraudHistory(userId: string): FraudDetection[] {
  return Array.from(fraudDetections.values()).filter((f) => f.userId === userId);
}

// ============================================
// IP WHITELIST
// ============================================

const ipWhitelists: Map<string, IPWhitelist> = new Map();

export function enableIPWhitelist(userId: string, ipAddresses: string[]): IPWhitelist {
  const whitelist: IPWhitelist = {
    userId,
    ipAddresses,
    isEnabled: true,
  };

  ipWhitelists.set(userId, whitelist);
  return whitelist;
}

export function disableIPWhitelist(userId: string): boolean {
  const whitelist = ipWhitelists.get(userId);
  if (!whitelist) return false;

  whitelist.isEnabled = false;
  return true;
}

export function addIPToWhitelist(userId: string, ipAddress: string): IPWhitelist | null {
  const whitelist = ipWhitelists.get(userId);
  if (!whitelist) return null;

  if (!whitelist.ipAddresses.includes(ipAddress)) {
    whitelist.ipAddresses.push(ipAddress);
  }

  return whitelist;
}

export function removeIPFromWhitelist(userId: string, ipAddress: string): IPWhitelist | null {
  const whitelist = ipWhitelists.get(userId);
  if (!whitelist) return null;

  whitelist.ipAddresses = whitelist.ipAddresses.filter((ip) => ip !== ipAddress);
  return whitelist;
}

export function isIPWhitelisted(userId: string, ipAddress: string): boolean {
  const whitelist = ipWhitelists.get(userId);
  if (!whitelist || !whitelist.isEnabled) return true;

  return whitelist.ipAddresses.includes(ipAddress);
}

// ============================================
// ACCOUNT LOCKOUT
// ============================================

const accountLockouts: Map<string, AccountLockout> = new Map();

export function recordFailedLoginAttempt(userId: string): AccountLockout {
  let lockout = accountLockouts.get(userId);

  if (!lockout) {
    lockout = {
      userId,
      failedAttempts: 0,
      reason: 'Failed login attempts',
    };
  }

  lockout.failedAttempts++;

  // Lock account after 5 failed attempts for 15 minutes
  if (lockout.failedAttempts >= 5) {
    lockout.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }

  accountLockouts.set(userId, lockout);
  return lockout;
}

export function resetFailedAttempts(userId: string): AccountLockout | null {
  const lockout = accountLockouts.get(userId);
  if (!lockout) return null;

  lockout.failedAttempts = 0;
  lockout.lockedUntil = undefined;

  return lockout;
}

export function isAccountLocked(userId: string): boolean {
  const lockout = accountLockouts.get(userId);
  if (!lockout || !lockout.lockedUntil) return false;

  if (new Date() > lockout.lockedUntil) {
    lockout.lockedUntil = undefined;
    return false;
  }

  return true;
}

export function getAccountLockout(userId: string): AccountLockout | null {
  return accountLockouts.get(userId) || null;
}

// ============================================
// SECURITY COMPLIANCE
// ============================================

export function getSecurityScore(userId: string): number {
  let score = 100;

  const twoFactor = getTwoFactorAuth(userId);
  if (!twoFactor || !twoFactor.isEnabled) {
    score -= 20;
  }

  const biometric = biometricAccounts.get(userId);
  if (!biometric || !biometric.isEnabled) {
    score -= 15;
  }

  const whitelist = ipWhitelists.get(userId);
  if (!whitelist || !whitelist.isEnabled) {
    score -= 10;
  }

  const auditLogs = getUserAuditLogs(userId, 100);
  const failedLogs = auditLogs.filter((log) => log.status === 'failed');
  if (failedLogs.length > 10) {
    score -= Math.min(15, failedLogs.length);
  }

  const fraudHistory = getUserFraudHistory(userId);
  const blockedTransactions = fraudHistory.filter((f) => f.status === 'blocked');
  if (blockedTransactions.length > 0) {
    score -= Math.min(20, blockedTransactions.length * 5);
  }

  return Math.max(0, score);
}

export function getSecurityRecommendations(userId: string): string[] {
  const recommendations: string[] = [];

  const twoFactor = getTwoFactorAuth(userId);
  if (!twoFactor || !twoFactor.isEnabled) {
    recommendations.push('Enable two-factor authentication for better security');
  }

  const biometric = biometricAccounts.get(userId);
  if (!biometric || !biometric.isEnabled) {
    recommendations.push('Enable biometric authentication on your mobile device');
  }

  const whitelist = ipWhitelists.get(userId);
  if (!whitelist || !whitelist.isEnabled) {
    recommendations.push('Enable IP whitelist to restrict access from unknown locations');
  }

  const auditLogs = getUserAuditLogs(userId, 100);
  const failedLogs = auditLogs.filter((log) => log.status === 'failed');
  if (failedLogs.length > 5) {
    recommendations.push('Review recent failed login attempts');
  }

  return recommendations;
}
