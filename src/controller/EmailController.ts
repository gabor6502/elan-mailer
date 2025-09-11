import { EmailRecordService } from "../service/EmailRecordService";
const nodemailer = require("nodemailer");

type EmailResponse = {status: number, message: string}
type expectedJSON = {firstName: string, lastName: string, emailAddress: string, subject: string, date: string, message: string}

class MissingInfoError extends Error
{
    #_missing: string[]

    constructor()
    {
        super("Missing the following properties: ")
        this.#_missing = []
    }

    addMissing(name: string)
    {
        this.#_missing.length > 0 ? this.message += ", "+name : this.message += name
        this.#_missing.push(name)
    }

    get missing(): string[]
    {
        return [...this.#_missing]
    }

    hasErrors(): boolean
    {
        return this.#_missing.length > 0
    }
}

class DatabaseEntry
{
    #_firstName: string
    #_laststName: string
    #_emailAddress: string
    #_date: string

    constructor(fname: string | undefined, lname: string | undefined, eadd: string | undefined, date: string | undefined)
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
        let dbEntry: DatabaseEntry = new DatabaseEntry(reqJson.firstName, reqJson.lastName,  reqJson.emailAddress, reqJson.date)
        // TODO ^ catch this, maybe make it a method call instead of construction

        let resp: EmailResponse

        // temp vars, add to class
        let message: string = reqJson.message
        let subject: string = reqJson.subject

        const emailResult = await this.#_transporter.sendMail({
            from: process.env.SMTP_CONTACT_ADDRESS, 
            to: process.env.SMTP_CONTACT_ADDRESS,
            subject: subject,
            text: "From: "+reqJson.emailAddress+"\n"+message
        })
        console.log(emailResult.response)

        try
        {
            await this.#_recordsService.addRecord(dbEntry.firstName, dbEntry.lastName, dbEntry.emailAddress, dbEntry.date)

            resp = {status: 201, message: "success"} // 201 for record inserted
        } catch (error)
        {
            resp = {status:500, message: error.message}

            // todo add error handling for db inserton

        }
            
        return resp
    }
}