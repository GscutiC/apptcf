/**
 * Sistema de logging mejorado para el módulo de configuración
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class ConfigLogger {
  private enabled: boolean = true;
  private minLevel: LogLevel = 'debug';
  
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private shouldLog(level: LogLevel): boolean {
    return this.enabled && this.levels[level] >= this.levels[this.minLevel];
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`🔍 [Config Debug] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`ℹ️ [Config Info] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ [Config Warning] ${message}`, ...args);
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      console.error(`❌ [Config Error] ${message}`, error);
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`✅ [Config Success] ${message}`, ...args);
    }
  }

  loading(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`📥 [Config Loading] ${message}`, ...args);
    }
  }

  saving(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`💾 [Config Saving] ${message}`, ...args);
    }
  }

  sync(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`🔄 [Config Sync] ${message}`, ...args);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

export const configLogger = new ConfigLogger();

// Desactivar en producción
if (process.env.NODE_ENV === 'production') {
  configLogger.setEnabled(false);
}
