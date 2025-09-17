const nodemailer = require("nodemailer");

/**
 * @name Transporter
 * 
 * @description Handles sending emails with nodemailer and the SMTP configuration in the .env file
 */
export class Transporter
{
    static #_transporter = null // instance of Transporter class
    #_nodemailer // the configured nodemailer that can send emails

    protected constructor() // protected so that it can be mocked
    {
        this.#_nodemailer = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            auth:
            {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    }

    /**
     * @name getInstance
     * 
     * @description Returns singleton instance of transporter
     */
    static getInstance(): Transporter
    {
        if (Transporter.#_transporter == null)
        {
            Transporter.#_transporter = new Transporter()
        }

        return Transporter.#_transporter
    }

    async send(firstName: string, lastName: string, emailAddress: string, subject: string, message: string)
    {
        return await this.#_nodemailer.sendMail({
                from: process.env.SMTP_CONTACT_ADDRESS, 
                to: process.env.SMTP_CONTACT_ADDRESS,
                subject: subject,
                text: `From ${firstName} ${lastName} (${emailAddress})\n\n${message}`
            })
    }
}