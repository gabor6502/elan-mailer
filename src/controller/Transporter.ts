const nodemailer = require("nodemailer");

export class Transporter
{
    static #_transporter = null

    private constructor()
    {
        Transporter.#_transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            auth:
            {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    }

    get getInstance()
    {
        if (Transporter.#_transporter == null)
        {
            Transporter.#_transporter = new Transporter()
        }

        return Transporter.#_transporter
    }

    async send(emailAddress: string, subject: string, message: string)
    {
        return await Transporter.#_transporter.sendMail({
                from: process.env.SMTP_CONTACT_ADDRESS, 
                to: process.env.SMTP_CONTACT_ADDRESS,
                subject: subject,
                text: "From: "+emailAddress+"\n\n"+message
            })
    }
}