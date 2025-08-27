import { EmailRecordService } from "../service/EmailRecordService";
const nodemailer = require("nodemailer");

type EmailResponse = {status: number, message: string}

/**
 * @name EmailControler
 *
 * @description Communicates with the email records service and handles HTTP requests
 */
export class EmailControler
{
    #_recordsService: EmailRecordService
    #_transporter

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

    async sendEmail(): Promise<EmailResponse>
    {

        const emailResult = await this.#_transporter.sendMail({
            from: process.env.SMTP_CONTACT_ADDRESS, // once testing is done, change this to accept a valid email
            to: process.env.SMTP_CONTACT_ADDRESS,
            subject: "Testing",
            text: "You've been tested"
        })
        console.log(emailResult.response)

        // 201 for record inserted
        return {status: 201, message: "success"}
    }
}