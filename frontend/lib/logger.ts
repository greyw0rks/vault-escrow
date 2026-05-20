type Level = 'debug' | 'info' | 'warn' | 'error';

const IS_DEV = process.env.NODE_ENV === 'development';

function log(level: Level, msg: string, data?: unknown) {
  if (!IS_DEV && level === 'debug') return;
  const prefix = '[VaultSTX]';
  const ts = new Date().toISOString().slice(11, 23);
  const line = prefix + ' ' + ts + ' ' + msg;
  if (data !== undefined) {
    console[level](line, data);
  } else {
    console[level](line);
  }
}

export const logger = {
  debug: (msg: string, data?: unknown) => log('debug', msg, data),
  info:  (msg: string, data?: unknown) => log('info',  msg, data),
  warn:  (msg: string, data?: unknown) => log('warn',  msg, data),
  error: (msg: string, data?: unknown) => log('error', msg, data),
};
