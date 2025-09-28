// Logger Service - Merkezi loglama servisi
import * as Sentry from '@sentry/react-native';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  userId?: string;
  screen?: string;
  action?: string;
  [key: string]: unknown;
}

class LoggerService {
  private isDevelopment = __DEV__;
  private isLoggingEnabled = __DEV__; // Production'da logları kapat
  private isErrorLoggingEnabled = true; // Hata logları her zaman açık

  /**
   * Debug logları - sadece development'da ve logging açıksa gösterilir
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment && this.isLoggingEnabled) {
      console.log(`🐛 [DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info logları - logging açıksa gösterilir
   */
  info(message: string, context?: LogContext): void {
    if (this.isLoggingEnabled) {
      console.log(`ℹ️ [INFO] ${message}`, context || '');
    }
    
    // Sentry'ye info level'da gönderme (sadece production'da ve logging açıksa)
    if (!this.isDevelopment && this.isLoggingEnabled) {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: context || {},
      });
    }
  }

  /**
   * Warning logları - önemli uyarılar (her zaman gösterilir)
   */
  warn(message: string, context?: LogContext): void {
    if (this.isLoggingEnabled) {
      console.warn(`⚠️ [WARN] ${message}`, context || '');
    }
    
    // Sentry'ye warning gönder (sadece production'da ve logging açıksa)
    if (!this.isDevelopment && this.isLoggingEnabled) {
      Sentry.addBreadcrumb({
        message,
        level: 'warning',
        data: context || {},
      });
    }
  }

  /**
   * Error logları - hatalar ve exception'lar (her zaman gösterilir)
   */
  error(message: string, error?: Error, context?: LogContext): void {
    // Error logları her zaman gösterilir
    console.error(`❌ [ERROR] ${message}`, error || '', context || '');
    
    // Sentry'ye error gönder (her zaman)
    if (this.isErrorLoggingEnabled) {
      Sentry.captureException(error || new Error(message), {
        tags: {
          level: 'error',
          ...context,
        },
        extra: context || {},
      });
    }
  }

  /**
   * Performance logları - performans metrikleri (sadece logging açıksa)
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    const message = `⏱️ [PERF] ${operation} took ${duration}ms`;
    
    if (this.isDevelopment && this.isLoggingEnabled) {
      console.log(message, context || '');
    }
    
    // Sentry'ye performance metric gönder (sadece production'da ve logging açıksa)
    if (!this.isDevelopment && this.isLoggingEnabled) {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: {
          operation,
          duration,
          ...context,
        },
      });
    }
  }

  /**
   * User action logları - kullanıcı aksiyonları (sadece logging açıksa)
   */
  userAction(action: string, screen: string, context?: LogContext): void {
    const message = `👤 [USER] ${action} on ${screen}`;
    
    if (this.isDevelopment && this.isLoggingEnabled) {
      console.log(message, context || '');
    }
    
    // Sentry'ye user action gönder (sadece production'da ve logging açıksa)
    if (!this.isDevelopment && this.isLoggingEnabled) {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: {
          action,
          screen,
          ...context,
        },
      });
    }
  }

  /**
   * API call logları - API çağrıları (sadece logging açıksa)
   */
  apiCall(method: string, url: string, status?: number, duration?: number, context?: LogContext): void {
    const message = `🌐 [API] ${method} ${url}${status ? ` - ${status}` : ''}${duration ? ` (${duration}ms)` : ''}`;
    
    if (this.isDevelopment && this.isLoggingEnabled) {
      console.log(message, context || '');
    }
    
    // Sentry'ye API call gönder (sadece production'da ve logging açıksa)
    if (!this.isDevelopment && this.isLoggingEnabled) {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: {
          method,
          url,
          status,
          duration,
          ...context,
        },
      });
    }
  }

  /**
   * Database operation logları - veritabanı işlemleri (sadece logging açıksa)
   */
  database(operation: string, table: string, duration?: number, context?: LogContext): void {
    const message = `🗄️ [DB] ${operation} on ${table}${duration ? ` (${duration}ms)` : ''}`;
    
    if (this.isDevelopment && this.isLoggingEnabled) {
      console.log(message, context || '');
    }
    
    // Sentry'ye database operation gönder (sadece production'da ve logging açıksa)
    if (!this.isDevelopment && this.isLoggingEnabled) {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: {
          operation,
          table,
          duration,
          ...context,
        },
      });
    }
  }

  /**
   * Navigation logları - ekran geçişleri (sadece logging açıksa)
   */
  navigation(from: string, to: string, context?: LogContext): void {
    const message = `🧭 [NAV] ${from} → ${to}`;
    
    if (this.isDevelopment && this.isLoggingEnabled) {
      console.log(message, context || '');
    }
    
    // Sentry'ye navigation gönder (sadece production'da ve logging açıksa)
    if (!this.isDevelopment && this.isLoggingEnabled) {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: {
          from,
          to,
          ...context,
        },
      });
    }
  }

  /**
   * Set user context for Sentry
   */
  setUser(userId: string, email?: string, username?: string): void {
    const user: any = { id: userId };
    if (email) user.email = email;
    if (username) user.username = username;
    
    Sentry.setUser(user);
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    Sentry.setUser(null);
  }

  /**
   * Set custom context
   */
  setContext(key: string, context: Record<string, unknown>): void {
    Sentry.setContext(key, context);
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(message: string, level: LogLevel = LogLevel.INFO, context?: LogContext): void {
    if (this.isLoggingEnabled) {
      Sentry.addBreadcrumb({
        message,
        level: level as any, // Sentry'nin SeverityLevel tipi ile uyumlu hale getir
        data: context || {},
      });
    }
  }

  /**
   * Logging'i aç/kapat
   */
  setLoggingEnabled(enabled: boolean): void {
    this.isLoggingEnabled = enabled;
    if (this.isDevelopment) {
      console.log(`📊 Logging ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Error logging'i aç/kapat
   */
  setErrorLoggingEnabled(enabled: boolean): void {
    this.isErrorLoggingEnabled = enabled;
    if (this.isDevelopment) {
      console.log(`❌ Error logging ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Logging durumunu kontrol et
   */
  isLoggingOn(): boolean {
    return this.isLoggingEnabled;
  }

  /**
   * Error logging durumunu kontrol et
   */
  isErrorLoggingOn(): boolean {
    return this.isErrorLoggingEnabled;
  }

  /**
   * Tüm logları kapat (sadece error'lar kalır)
   */
  disableAllLogging(): void {
    this.setLoggingEnabled(false);
    this.setErrorLoggingEnabled(true); // Error'ları açık tut
  }

  /**
   * Tüm logları aç
   */
  enableAllLogging(): void {
    this.setLoggingEnabled(true);
    this.setErrorLoggingEnabled(true);
  }
}

export const loggerService = new LoggerService();
export default loggerService;
