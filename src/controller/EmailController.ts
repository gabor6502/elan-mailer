import { EmailRecordService, CharacterLimitError, EmailFormatError } from "../service/EmailRecordService";
import { Transporter } from "./Transporter";
import { Logger } from "../logger/Logger"

export type EmailResponse = {status: number, message: string}
export type RequestJSON = {firstName: string | undefined, lastName: string | undefined, emailAddress: string | undefined, subject: string| undefined, message: string | undefined}

class MissingInfoError extends Error
{
    constructor()
    {
        super("")
    }

    addMissing(name: string)
    {
        if (this.message.length > 0)
        {
            this.message += ", "+name
        }
        else
        {
            this.message = "The following properties are undefined or empty: " + name
        }
    }

    hasErrors(): boolean
    {
        return this.message.length > 0
    }
}

function noUndef(firstName: string | undefined, lastName: string | undefined, emailAddress: string | undefined, subject: string| undefined, message: string | undefined)
{
    let missingInfoError: MissingInfoError = new MissingInfoError() // just in case

    if (firstName === undefined || !firstName.length)
    {
        missingInfoError.addMissing("firstName")
    }
    if (lastName === undefined || !lastName.length)
    {
        missingInfoError.addMissing("lastName")
    }
    if (emailAddress === undefined || !emailAddress.length)
    {
        missingInfoError.addMissing("emailAddress")
    }
    if (subject === undefined || !subject.length)
    {
        missingInfoError.addMissing("subject")
    }
    if (message === undefined || !message.length)
    {
        missingInfoError.addMissing("message")
    }

    if (missingInfoError.hasErrors())
    {
        throw missingInfoError;
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

    async sendEmail(reqJson: RequestJSON): Promise<EmailResponse>
    {
        let emailResult: any

        // ensure nothing is missing
        try
        {
            noUndef(reqJson.firstName, reqJson.lastName, reqJson.emailAddress, reqJson.subject, reqJson.message)
        } catch(error)
        {
            this.#_logger.error(error.message)
            return {status: 400, message: error.message}
        }
        
        this.#_logger.info("Going to send a message from "+reqJson.emailAddress)
        
        // make sure the sender hasn't sent an email to you too recently (spam protection/quota management)
        if (await this.#_recordsService.unsendable(reqJson.emailAddress))
        {
            return {status: 403, message: `Another email has been sent from ${reqJson.emailAddress} too soon ago`}
        }
        
        // save an entry
        this.#_logger.info("Creating a record in the database ...")
        try
        {
            await this.#_recordsService.addRecord(reqJson.firstName, reqJson.lastName, reqJson.emailAddress)
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
