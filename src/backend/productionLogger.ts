import log from "electron-log/main";
import prcs from "process";
import { Print } from "@2022amallick/print-colors";

export class LoggerMain {
  private instance: LoggerMain;
  constructor() {
    if (this.instance) {
      return this.instance;
    }
    log.initialize();
    log.errorHandler.startCatching({
      onError: (err) => {
        this.error(`Error: ${err}`);
      },
    });
    this.instance = this;
  }

  log(message: string) {
    if (process.env.NODE_ENV !== "development") {
      log.info(`${new Date()} - ${message}`);
    } else {
      Print.cyan(`${new Date()} - ${message}`);
    }
  }

  error(message: string) {
    if (process.env.NODE_ENV !== "development") {
      log.error(`${new Date()} - ${message}`);
    } else {
      Print.red(`${new Date()} - ${message}`);
    }
  }

  logInfo() {
    log.log("\n\n");
    this.log(`process.resourcesPath is: ${prcs.resourcesPath}`);
    this.log(`process.platform is: ${prcs.platform}`);
    log.log("\n\n");
  }
}
