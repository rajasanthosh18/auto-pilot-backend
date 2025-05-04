import debug from "debug";

class Logger {
  private namespace: string;
  private debugLogger: debug.Debugger;
  private errorLogger: debug.Debugger;
  private warnLogger: debug.Debugger;
  private infoLogger: debug.Debugger;

  constructor(namespace: string) {
    this.namespace = namespace;
    this.debugLogger = debug(`${namespace}:debug`);
    this.errorLogger = debug(`${namespace}:error`);
    this.warnLogger = debug(`${namespace}:warn`);
    this.infoLogger = debug(`${namespace}:info`);

    // Add colors to different log levels
    this.errorLogger.color = "1;31"; // bright red
    this.warnLogger.color = "1;33"; // bright yellow
    this.infoLogger.color = "1;36"; // bright cyan
    this.debugLogger.color = "1;34"; // bright blue
  }

  error(message: string, ...args: any[]) {
    this.errorLogger(message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.warnLogger(message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.infoLogger(message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.debugLogger(message, ...args);
  }
}

// Create logger instances for different components
export const logger = new Logger("app");
