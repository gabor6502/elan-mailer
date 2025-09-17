import { Between, EntityManager } from "typeorm"
import { MAX_CHARS, Record } from "../entity/Record"
import { Logger } from "../logger/Logger"

// the expected format for emails
const EMAIL_REGEX = /[\w\-\.]+[@]([\w]+\.)+[\w\-]{2,}/

// minutes past when it's okay for the same email addresss to send another email
const THRESHOLD_MINS = 15

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
     * @param emailAddr Email address of sender
     */
    async addRecord(fname: string, lname: string, emailAddr: string): Promise<void>
    {
        // validate input

        if (fname.length > MAX_CHARS || lname.length > MAX_CHARS || emailAddr.length > MAX_CHARS)
        {
            throw new CharacterLimitError()
        }
        else if (!EMAIL_REGEX.test(emailAddr))
        {
            throw new EmailFormatError()
        }

        this.#_logger.info(`Inserting record {${fname}, ${lname}, ${emailAddr}, ${new Date().toString()}} ... `)
        await this.#_recManager.insert(Record, {firstName: fname, lastName: lname, emailAddress: emailAddr, dateSent: new Date()})
        this.#_logger.info("Record inserted")
    }

    /**
     * @name unsendable
     * 
     * @description Determines if this email address has sent an email too short between time between the last one.
     * 
     * @param emailAddress The email address of the sender
     * 
     * @returns Promise<boolean>
     */
    async unsendable(emailAddress: string): Promise<boolean>
    {
        const currentTime = new Date()
        const threshold = new Date(currentTime)
        threshold.setMinutes(threshold.getMinutes() - THRESHOLD_MINS)

        let ents = await this.#_recManager.findOneBy(Record, 
                    { 
                    emailAddress: emailAddress, 
                    dateSent: Between(threshold, currentTime)
                    })

        return ents != null // if we have found anything as of recent, it's not okay to send
    }
}