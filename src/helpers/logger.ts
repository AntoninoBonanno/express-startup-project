import winston from 'winston'
import 'winston-daily-rotate-file';
import environment from "../environment";

/**
 * This method set the current severity based on the environment mode:
 * show all the log levels if the server was run in development mode;
 * otherwise, if it was run in production, show info, warn and error messages.
 */
const level = () => {
    return environment.isProduction() ? 'info' : 'debug';
}

// Change default colors
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
});

// Set the logging text format
const format = winston.format.combine(
    // Add the message timestamp with the preferred format
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    // Define the format of the message showing the timestamp, the level and the message
    winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message?.trim()}`)
);

// Set the shared DailyRotateFile transport config
const fileConfig = {
    format,
    datePattern: 'YYYY_MM_DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    createSymlink: true
}

// Define which transports the logger must use to print out messages.
const transports = [
    // Allow the use the console to print the colorize messages
    new winston.transports.Console({
        format: winston.format.combine(
            format,
            winston.format.colorize({all: true})
        )
    }),
    // Allow to print all the error level messages inside the error.log file
    new winston.transports.DailyRotateFile({
        filename: 'logs/errors/errors_%DATE%.log',
        level: 'error',
        ...fileConfig
    }),
    // Allow to print all the error message inside the all.log file
    new winston.transports.DailyRotateFile({filename: 'logs/all/all_%DATE%.log', ...fileConfig})
]

const Logger = winston.createLogger({
    level: level(),
    transports
})

export default Logger;
