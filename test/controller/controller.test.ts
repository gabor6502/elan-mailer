import { EmailController, EmailResponse, RequestJSON } from "../../src/controller/EmailController"
import { Transporter } from "../../src/controller/Transporter"
import { EmailRecordService } from "../../src/service/EmailRecordService"
import { Logger } from "../../src/logger/Logger"

jest.mock("../../src/logger/logger")
jest.mock("../../src/service/EmailRecordService")
class MockedTransporter extends Transporter // singleton mock that will suffice for now
{
    #_calledSendCount = 0

    constructor() { super() }
    // override
    async send(firstName: string, lastName: string, emailAddress: string, subject: string, message: string): Promise<any> 
    { 
        // we won't be testing the transporter in this test, so this is really the only thing send needs to do
        this.#_calledSendCount++
        return {response: "I sent an email :3"}
    }

    calledOnce(): boolean
    {
        return this.#_calledSendCount === 1
    }

    calledAtAll(): boolean
    {
        return this.#_calledSendCount > 0
    }
}

describe("Email Controller: ", () => 
{
    var controller: EmailController

    var logger: jest.Mocked<Logger>
    var transporter: MockedTransporter
    var service: jest.Mocked<EmailRecordService>

    var emailJSON: RequestJSON = { firstName: "Roy", lastName: "Dismey", emailAddress: "roy.dismey@yahoo.ca", subject: "Hello", message: "See subject line." }

    beforeEach(() => 
    {
        logger = new (<new () => Logger>Logger)() as jest.Mocked<Logger>
        jest.spyOn(logger, "info").mockImplementation(() => {})
        jest.spyOn(logger, "error").mockImplementation(() => {})

        transporter = new MockedTransporter()
        service = new (<new () => EmailRecordService>EmailRecordService)() as jest.Mocked<EmailRecordService>
        controller = new EmailController(service, transporter, logger)
    })

    it("should send 201 since the email was sent okay and the service said it added a record", async () => 
    {
        let resp: EmailResponse

        // given
        service.unsendable.mockImplementationOnce(async (eadd) => {return false})
        service.addRecord.mockImplementationOnce(async (f, l, e) => {})

        // when
        resp = await controller.sendEmail(emailJSON)

        // then
        expect(service.unsendable).toHaveBeenCalledTimes(1)
        expect(service.addRecord).toHaveBeenCalledTimes(1)
        expect(transporter.calledOnce()).toBe(true)
        expect(resp.status).toEqual(201)
        expect(resp.message).toBeTruthy();
    })

    it("should send 403 because the service said it wasn't sendable", async () => 
    {
        let resp: EmailResponse

        // given
        service.unsendable.mockImplementationOnce(async (eadd) => {return true})

        // when
        resp = await controller.sendEmail(emailJSON)

        // then
        expect(service.unsendable).toHaveBeenCalledTimes(1)
        expect(service.addRecord).toHaveBeenCalledTimes(0)
        expect(transporter.calledAtAll()).toBe(false)
        expect(resp.status).toEqual(403)
        expect(resp.message).toBeTruthy();
    })

    it("should send 400 because all items expected from body are missing", async () => 
    {
        let resp: EmailResponse

        // given
        let req: RequestJSON = {firstName: undefined, lastName: undefined, emailAddress: undefined, subject: undefined, message: undefined}

        // when
        resp = await controller.sendEmail(req)

        // then
        expect(service.unsendable).toHaveBeenCalledTimes(0)
        expect(service.addRecord).toHaveBeenCalledTimes(0)
        expect(transporter.calledAtAll()).toBe(false)
        expect(resp.status).toEqual(400)
        expect(resp.message).toBeTruthy();
    })

    it("", () => 
    {
        // given
        // when
        // then
    })

    it("", () => 
    {
        // given
        // when
        // then
    })

    it("", () => 
    {
        // given
        // when
        // then
    })

    it("", () => 
    {
        // given
        // when
        // then
    })

})

