const winston = require("winston")
const { combine, timestamp, label, printf } = winston.format

/**
 * @name Logger
 * 
 * @description Wraps a winston logger for use by specific components of the app.
 */
export class Logger
{
    #_logger

    /**
     * @name constructor
     * 
     * @description Sets up a new logger instance to use
     * 
     * @param componentName What component in the app does this logger log from?
     */
    constructor(componentName: string)
    {
        let logFormat = combine(
                label({ label: componentName }), 
                timestamp(), 
                printf(({ level, message, label, timestamp }) => 
                    {
                    return `${timestamp} [${label}] ${level}: ${message}`
                    }))

        this.#_logger = winston.createLogger(
        {
            format: logFormat,
            transports: [
                new winston.transports.File({ name: "error_logs", filename: "error.log", level: "error", json: false }),
                new winston.transports.File({ name: "combined_logs", filename: "combined.log", json: false }),
            ]
        })

        if (process.env.NODE_ENV !== "production")
        {
            this.#_logger.add(new winston.transports.Console({ format: logFormat }))
        }
    }

    /**
     * @name info
     * 
     * @description Logs an information message
     * 
     * @param message The message to log 
     */
    info(message: string)
    {
        this.#_logger.info(message)
    }

    /**
     * @name error
     * 
     * @description Logs an error message
     * 
     * @param message The message to log 
     */
    error(message: string)
    {
        this.#_logger.error(message)
    }
}