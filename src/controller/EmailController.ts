import { EmailRecordService, CharacterLimitError, DateFormatError, EmailFormatError } from "../service/EmailRecordService";

const nodemailer = require("nodemailer");

type EmailResponse = {status: number, message: string}
type expectedJSON = {firstName: string, lastName: string, emailAddress: string, subject: string, date: string, message: string}

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
    #_date: string

    private constructor(fname: string | undefined, lname: string | undefined, eadd: string | undefined, date: string | undefined)
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
        if (date == undefined)
        {
            missingInfoError.addMissing("date")
        }

        if (missingInfoError.hasErrors())
        {
            throw missingInfoError;
        }

        this.#_firstName = fname
        this.#_laststName = lname
        this.#_emailAddress = eadd
        this.#_date = date
    }

    static makeEntry(fname: string | undefined, lname: string | undefined, eadd: string | undefined, date: string | undefined): DatabaseEntry
    {
        return new DatabaseEntry(fname, lname, eadd, date)
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

    get date(): string
    {
        return this.#_date
    }
}

/**
 * @name EmailControler
 *
 * @description Communicates with the email records service and handles HTTP requests
 */
export class EmailControler
{
    #_recordsService: EmailRecordService
    #_transporter: any

    constructor(service: EmailRecordService)
    {
        this.#_recordsService = service

        this.#_transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            auth:
            {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    }

    async sendEmail(reqJson: expectedJSON): Promise<EmailResponse>
    {
        let dbEntry: DatabaseEntry

        let message: string = reqJson.message
        let subject: string = reqJson.subject
        let emailResult: any

        // create an entry
        try
        {
            dbEntry = DatabaseEntry.makeEntry(reqJson.firstName, reqJson.lastName,  reqJson.emailAddress, reqJson.date)
        } catch(error)
        {
            return {status: 400, message: error.message}
        }
        
        // save the entry
        try
        {
            await this.#_recordsService.addRecord(dbEntry.firstName, dbEntry.lastName, dbEntry.emailAddress, dbEntry.date)
        } catch (error)
        {
            if (error instanceof CharacterLimitError || error instanceof DateFormatError || error instanceof EmailFormatError)
            {
                return {status: 400, message: error.message}
            }
            else
            {
                return {status: 500, message: "A database error occured"}
            }
        }

        // now that it's recorded, send the email
        try
        {
            emailResult = await this.#_transporter.sendMail({
                from: process.env.SMTP_CONTACT_ADDRESS, 
                to: process.env.SMTP_CONTACT_ADDRESS,
                subject: subject,
                text: "From: "+reqJson.emailAddress+"\n\n"+message
            })
        } catch(error)
        {
            return {status: 500, message: "Could not send email"}
        }

        console.log(emailResult.response)

        return {status: 201, message: "success"} 
    }
}
