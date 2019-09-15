import * as winston from "winston";

// Globals
const { combine, timestamp } = winston.format;
const logLevelEnv = process.env.LOG_LEVEL || "info";

// tslint:disable:object-literal-sort-keys
const loggerOptions: winston.LoggerOptions = {
  exitOnError: false,
  level: logLevelEnv,
};
export const logger = winston.createLogger(loggerOptions);

logger.add(new winston.transports.Console({
  handleExceptions: true,
  format: combine(
    timestamp(),
    winston.format.colorize(),
  ),
  level: logLevelEnv,
}));
