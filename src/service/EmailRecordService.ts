import { EntityManager } from "typeorm"
import { MAX_CHARS, Record } from "../entity/Record"
import { Logger } from "../logger/logger"

// the expected format for dates that will be put in the DB
const DATE_REGEX = /20[2-9]\d:((0[1-9])|(1[0-2])):(([0-2][1-9])|(3[0-1]))Z[+|-](((0\d)|(1[0-2])):[0]{2})/

// the expected format for emails
const EMAIL_REGEX = /[\w\-\.]+[@]([\w]+\.)+[\w\-]{2,}/

/**
 * @name CharacterLimitError
 * 
 * @description Thrown when a string provided is too long for the database
 */
export class CharacterLimitError extends Error
{
    constructor()
    {
        super(`Character limit of ${MAX_CHARS} exceed.`)
    }
}

/**
 * @name DateFormatError
 * 
 * @description Thrown when a date is formatted improperly
 */
export class DateFormatError extends Error
{
    constructor()
    {
        super("Date was not in the format 'YYYY:MM:DDZ[+/-]##:00'.")
    }
}

/**
 * @name EmailFormatError
 * 
 * @description Thrown when an email is formatted improperly
 */
export class EmailFormatError extends Error
{
    constructor()
    {
        super("Email was not formatted correctly.")
    }
}

/**
 * @name EmailRecordService
 * 
 * @description Communicates with database to perform record creation and sends an email
 */
export class EmailRecordService
{
    #_recManager: EntityManager
    #_logger: Logger

    constructor(man: EntityManager, logger: Logger)
    {
        this.#_recManager = man
        this.#_logger = logger
    }

    /**
     * @name addRecord
     * 
     * @description Adds a record of an email sent into the database
     * 
     * @param fname First name of sender
     * @param lname Last name of sender
     * @param emailaddr Email address of sender
     * @param date Date email sent
     */
    async addRecord(fname: string, lname: string, emailaddr: string, date: string): Promise<void>
    {
        // valiate input

        if (fname.length > MAX_CHARS || lname.length > MAX_CHARS || emailaddr.length > MAX_CHARS)
        {
            throw new CharacterLimitError()
        }
        else if (!DATE_REGEX.test(date)) 
        {
            throw new DateFormatError()
        }
        else if (!EMAIL_REGEX.test(emailaddr))
        {
            throw new EmailFormatError()
        }

        this.#_logger.info(`Inserting record {${fname}, ${lname}, ${emailaddr}, ${date}} ... `)
        await this.#_recManager.insert(Record, {firstName: fname, lastName: lname, emailAddress: emailaddr, dateSent: new Date(date)})
        this.#_logger.info("Record inserted")
    }
}