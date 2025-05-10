import debug from "debug";

class Logger {
  private namespace: string;
  private debugLogger: debug.Debugger;
  private errorLogger: debug.Debugger;
  private warnLogger: debug.Debugger;
  private infoLogger: debug.Debugger;
  private responseLogger: debug.Debugger;

  constructor(namespace: string) {
    this.namespace = namespace;

    // Create logger instances
    this.debugLogger = debug(`${namespace}:debug`);
    this.errorLogger = debug(`${namespace}:error`);
    this.warnLogger = debug(`${namespace}:warn`);
    this.infoLogger = debug(`${namespace}:info`);
    this.responseLogger = debug(`${namespace}:response`);

    // Add colors to different log levels
    this.errorLogger.color = "1;31"; // bright red
    this.warnLogger.color = "1;33"; // bright yellow
    this.infoLogger.color = "1;36"; // bright cyan
    this.debugLogger.color = "1;34"; // bright blue
    this.responseLogger.color = "1;32"; // bright green

    // Override the log method for each logger to prepend timestamp
    const originalLog = debug.log;
    debug.log = (...args: any[]) => {
      const time = new Date().toISOString();
      if (typeof args[0] === "string") {
        args[0] = `${time} ${args[0]}`;
      }
      originalLog.apply(debug, args);
    };
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

  response(message: string, ...args: any[]) {
    this.responseLogger(message, ...args);
  }
}

// Create logger instances for different components
export const logger = new Logger("app");
