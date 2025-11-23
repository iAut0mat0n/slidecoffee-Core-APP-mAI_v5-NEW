import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  } : undefined,
});

export interface SecurityEvent {
  type: 'mfa_failure' | 'mime_mismatch' | 'upload_rejected' | 'unauthorized_access' | 'rate_limit_exceeded';
  userId?: string;
  email?: string;
  ip?: string;
  endpoint?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export class SecurityLogger {
  private static instance: SecurityLogger;

  private constructor() {}

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  logSecurityEvent(event: SecurityEvent): void {
    const logData = {
      timestamp: new Date().toISOString(),
      ...event,
    };

    switch (event.severity) {
      case 'critical':
        logger.fatal(logData, `[SECURITY ${event.type.toUpperCase()}]`);
        break;
      case 'high':
        logger.error(logData, `[SECURITY ${event.type.toUpperCase()}]`);
        break;
      case 'medium':
        logger.warn(logData, `[SECURITY ${event.type.toUpperCase()}]`);
        break;
      case 'low':
      default:
        logger.info(logData, `[SECURITY ${event.type.toUpperCase()}]`);
        break;
    }

    if (event.severity === 'critical' || event.severity === 'high') {
      this.alertOnCriticalEvent(event);
    }
  }

  private alertOnCriticalEvent(event: SecurityEvent): void {
    console.error('\n🚨 CRITICAL SECURITY EVENT 🚨');
    console.error(JSON.stringify(event, null, 2));
  }

  mfaFailure(userId: string, email: string, ip: string, currentAAL: string, nextAAL: string): void {
    this.logSecurityEvent({
      type: 'mfa_failure',
      userId,
      email,
      ip,
      severity: 'high',
      metadata: { currentAAL, nextAAL },
    });
  }

  mimeMismatch(userId: string | undefined, ip: string, declaredMime: string, detectedMime: string, filename: string): void {
    this.logSecurityEvent({
      type: 'mime_mismatch',
      userId,
      ip,
      endpoint: '/system/upload-logo',
      severity: 'high',
      metadata: { declaredMime, detectedMime, filename },
    });
  }

  uploadRejected(userId: string | undefined, ip: string, reason: string, filename: string): void {
    this.logSecurityEvent({
      type: 'upload_rejected',
      userId,
      ip,
      endpoint: '/system/upload-logo',
      severity: 'medium',
      metadata: { reason, filename },
    });
  }

  unauthorizedAccess(endpoint: string, ip: string, userId?: string, requiredRole?: string): void {
    this.logSecurityEvent({
      type: 'unauthorized_access',
      userId,
      ip,
      endpoint,
      severity: 'medium',
      metadata: { requiredRole },
    });
  }

  rateLimitExceeded(endpoint: string, ip: string): void {
    this.logSecurityEvent({
      type: 'rate_limit_exceeded',
      ip,
      endpoint,
      severity: 'low',
    });
  }
}

export const securityLogger = SecurityLogger.getInstance();
