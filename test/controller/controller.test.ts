import { EmailController, EmailResponse, RequestJSON } from "../../src/controller/EmailController"
import { Transporter } from "../../src/controller/Transporter"
import { CharacterLimitError, EmailFormatError, EmailRecordService } from "../../src/service/EmailRecordService"
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
        let emailJSON: RequestJSON = { firstName: "Roy", lastName: "Dismey", emailAddress: "roy.dismey@yahoo.ca", subject: "Hello", message: "See subject line." }

        resp = await controller.sendEmail(emailJSON)

        // then
        expect(service.unsendable).toHaveBeenCalledTimes(1)
        expect(service.addRecord).toHaveBeenCalledTimes(1)
        expect(transporter.calledOnce()).toBe(true)
        expect(resp.status).toEqual(201)
        expect(resp.message).toBeDefined()
    })

    it("should send 400 because at least one item expected in the body is undefined", async () => 
    {
        let resp: EmailResponse

        // when
        let req: RequestJSON = {firstName: undefined, lastName: undefined, emailAddress: undefined, subject: undefined, message: undefined}

        resp = await controller.sendEmail(req)

        // then
        expect(service.unsendable).toHaveBeenCalledTimes(0)
        expect(service.addRecord).toHaveBeenCalledTimes(0)
        expect(transporter.calledAtAll()).toBe(false)
        expect(resp.status).toEqual(400)
        expect(resp.message).toBeDefined()
    })

    it("should send 400 because at least one item expected in the body is an empty string", async () => 
    {
        let resp: EmailResponse

        // when
        let req: RequestJSON = {firstName: "", lastName: "", emailAddress: "", subject: "", message: ""}

        resp = await controller.sendEmail(req)

        // then
        expect(service.unsendable).toHaveBeenCalledTimes(0)
        expect(service.addRecord).toHaveBeenCalledTimes(0)
        expect(transporter.calledAtAll()).toBe(false)
        expect(resp.status).toEqual(400)
        expect(resp.message).toBeDefined()
    })

    it("should send 403 because the service said it wasn't sendable", async () => 
    {
        let resp: EmailResponse

        // given
        service.unsendable.mockImplementationOnce(async (eadd) => {return true})

        // when
        // *more of a service thing, just need to see controller's reaction*

        resp = await controller.sendEmail({firstName: "h", lastName: "e", emailAddress: "l", subject: "l", message: "o"})

        // then
        expect(service.unsendable).toHaveBeenCalledTimes(1)
        expect(service.addRecord).toHaveBeenCalledTimes(0)
        expect(transporter.calledAtAll()).toBe(false)
        expect(resp.status).toEqual(403)
        expect(resp.message).toBeDefined()
    })

    it("should send 400 because there's too many characters in at least one of the strings", async () => 
    {
        let resp: EmailResponse

        // given
        service.unsendable.mockImplementationOnce(async (eadd) => {return false})
        service.addRecord.mockImplementationOnce(async (f, l, e) => {throw new CharacterLimitError()})

        // when
        // *more of a service thing, just need to see controller's reaction*

        resp = await controller.sendEmail({firstName: "h", lastName: "e", emailAddress: "l", subject: "l", message: "o"})

        // then
        expect(service.unsendable).toHaveBeenCalledTimes(1)
        expect(service.addRecord).toHaveBeenCalledTimes(1)
        expect(transporter.calledAtAll()).toBe(false)
        expect(resp.status).toEqual(400)
        expect(resp.message).toBeDefined()
    })

    it("should send 400 because of a poorly formatted email", async () => 
    {
        let resp: EmailResponse

        // given
        service.unsendable.mockImplementationOnce(async (eadd) => {return false})
        service.addRecord.mockImplementationOnce(async (f, l, e) => {throw new EmailFormatError()})

        // when
        // *more of a service thing, just need to see controller's reaction*

        resp = await controller.sendEmail({firstName: "Firstingon", lastName: "Lastington", emailAddress: "wow really bad!!!!", subject: "le hi", message: "el hola"})

        // then
        expect(service.unsendable).toHaveBeenCalledTimes(1)
        expect(service.addRecord).toHaveBeenCalledTimes(1)
        expect(transporter.calledAtAll()).toBe(false)
        expect(resp.status).toEqual(400)
        expect(resp.message).toBeDefined()
    })

})

