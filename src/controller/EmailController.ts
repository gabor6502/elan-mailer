import { EmailRecordService } from "../service/EmailRecordService";

type EmailResponse = {status: number, message: string}

/**
 * @name EmailControler
 *
 * @description Communicates with the email records service and handles HTTP requests
 */
export class EmailControler
{
    #_recordsService: EmailRecordService

    constructor(service: EmailRecordService)
    {
        this.#_recordsService = service
    }

    async sendEmail(): Promise<EmailResponse>
    {
        return {status: 201, message: "success"}
    }
}