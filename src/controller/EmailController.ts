import { EmailRecordService, CharacterLimitError, EmailFormatError } from "../service/EmailRecordService";
import { Transporter } from "./Transporter";
import { Logger } from "../logger/logger"

export type EmailResponse = {status: number, message: string}
type expectedJSON = {firstName: string, lastName: string, emailAddress: string, subject: string, message: string}

class MissingInfoError extends Error
{
    #_hasErrors

    constructor()
    {
        super("Missing the following properties: ")
        this.#_hasErrors = false
    }

    addMissing(name: string)
    {
        if (!this.#_hasErrors)
        {
            this.#_hasErrors = true
            this.message = this.message + name
        }
        else
        {
            this.message += ", "+name
        }
    }

    hasErrors(): boolean
    {
        return this.#_hasErrors
    }
}

class DatabaseEntry
{
    #_firstName: string
    #_laststName: string
    #_emailAddress: string

    private constructor(fname: string | undefined, lname: string | undefined, eadd: string | undefined)
    {
        let missingInfoError: MissingInfoError = new MissingInfoError() // just in case

        if (fname == undefined)
        {
            missingInfoError.addMissing("firstName")
        }
        if (lname == undefined)
        {
            missingInfoError.addMissing("lastName")
        }
        if (eadd == undefined)
        {
            missingInfoError.addMissing("emailAddress")
        }

        if (missingInfoError.hasErrors())
        {
            throw missingInfoError;
        }

        this.#_firstName = fname
        this.#_laststName = lname
        this.#_emailAddress = eadd
    }

    static makeEntry(fname: string | undefined, lname: string | undefined, eadd: string | undefined): DatabaseEntry
    {
        return new DatabaseEntry(fname, lname, eadd)
    }

    get firstName(): string
    {
        return this.#_firstName
    }

    get lastName(): string
    {
        return this.#_laststName
    }

    get emailAddress(): string
    {
        return this.#_emailAddress
    }
}

/**
 * @name EmailController
 *
 * @description Communicates with the email records service and handles HTTP requests
 */
export class EmailController
{
    #_recordsService: EmailRecordService
    #_transporter: Transporter
    #_logger: Logger

    constructor(service: EmailRecordService, transporter: Transporter, logger: Logger)
    {
        this.#_recordsService = service
        this.#_transporter = transporter
        this.#_logger = logger
    }

    async sendEmail(reqJson: expectedJSON): Promise<EmailResponse>
    {
        let dbEntry: DatabaseEntry
        let emailResult: any

        this.#_logger.info("Going to send a message from "+reqJson.emailAddress)
        
        // TODO: make sure the sender hasn't sent an email to you too recently (spam protection/quota management)
        if (await this.#_recordsService.unsendable(reqJson.emailAddress))
        {
            return {status: 403, message: `Another email has been sent from ${reqJson.emailAddress} too soon ago`}
        }

        // create an entry
        this.#_logger.info("Creating a record in the database ...")
        try
        {
            dbEntry = DatabaseEntry.makeEntry(reqJson.firstName, reqJson.lastName,  reqJson.emailAddress)
        } catch(error)
        {
            this.#_logger.error(error.message)
            return {status: 400, message: error.message}
        }
        
        // save the entry
        try
        {
            await this.#_recordsService.addRecord(dbEntry.firstName, dbEntry.lastName, dbEntry.emailAddress)
        } catch (error)
        {
            if (error instanceof CharacterLimitError || error instanceof EmailFormatError)
            {
                this.#_logger.error(error.message)
                return {status: 400, message: error.message}
            }
            else
            {
                this.#_logger.error("Could not insert into database")
                return {status: 500, message: "A database error occured "+error.message}
            }
        }

        // now that it's recorded, send the email
        this.#_logger.info("Sending email ...")
        try
        {
            emailResult = await this.#_transporter.send(reqJson.firstName, reqJson.lastName, reqJson.emailAddress, reqJson.subject, reqJson.message)
        } catch(error)
        {
            return {status: 500, message: "Could not send email: "+error.message}
        }
        this.#_logger.info("Email sent - "+emailResult.response)

        return {status: 201, message: "success"} 
    }
}
