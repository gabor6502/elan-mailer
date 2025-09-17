import { EmailController, EmailResponse, RequestJSON } from "../../src/controller/EmailController"
import { EmailRecordService } from "../../src/service/EmailRecordService"
import { MAX_CHARS } from "../../src/entity/Record"
import { EntityManager } from "typeorm"
import { Logger } from "../../src/logger/Logger"


jest.mock("../../src/logger/logger")
jest.mock("typeorm", () => 
{
  const actual = jest.requireActual("typeorm");
  return {
    ...actual,
    EntityManager: jest.fn().mockImplementation(() => { 
        return {
            insert: jest.fn(), 
            findOneBy: jest.fn() 
        }
    })
  }
});


describe("Controller and Service Integration Test", () => 
{

    var controller: EmailController
    var service: EmailRecordService
    var manager: jest.Mocked<EntityManager>
    var logger: jest.Mocked<Logger>
    var transporter: any

    beforeEach(() => 
    {
        logger = new (<new () => Logger>Logger)() as jest.Mocked<Logger>
        jest.spyOn(logger, "info").mockImplementation(() => {})
        jest.spyOn(logger, "error").mockImplementation(() => {})

        transporter = 
        {
            send: jest.fn().mockImplementation(
                    async (firstName: string, lastName: string, emailAddress: string, subject: string, message: string) => 
                    {
                        return Promise<void>
                    })
        }
        manager = new (<new () => EntityManager>EntityManager)() as jest.Mocked<EntityManager>
        service = new EmailRecordService(manager, logger)
        controller = new EmailController(service, transporter, logger)
    })

    it("should send 201 after making a call to insert a record", async () => 
    {
        let resp: EmailResponse

        // given
        manager.findOneBy.mockResolvedValueOnce(null) // used by "unsendable" method, null returned on query means email is sendable

        // when
        let req: RequestJSON = { firstName: "Roy", lastName: "Dismey", emailAddress: "roy.dismey@yahoo.ca", subject: "Hello", message: "See subject line." }

        resp = await controller.sendEmail(req)

        // then
        expect(manager.insert).toHaveBeenCalled()
        expect(transporter.send).toHaveBeenCalled()
        expect(resp.status).toEqual(201)
        expect(resp.message).toBeDefined()
    })

    it("should send 400 since the controller sent the service something with too many characters", async () => 
    {
        let resp: EmailResponse
        let maxedOut: string = ""

        // given
        for (let i =0; i <= MAX_CHARS; i++)
        {
            maxedOut += 'e'
        }
        manager.findOneBy.mockResolvedValueOnce(null)
        
        // when
        resp = await controller.sendEmail({ firstName: "Roy", lastName: maxedOut, emailAddress: "yahoo@yahoo.ca", subject: "Hi", message: "Hi pt. 2" })

        // then
        expect(manager.insert).toHaveBeenCalledTimes(0)
        expect(transporter.send).toHaveBeenCalledTimes(0)
        expect(resp.status).toEqual(400)
        expect(resp.message).toBeDefined()
    })

    it("should send 400 since the controller sent the service a bad email address", async () => 
    {
        let resp: EmailResponse

        // given
        manager.findOneBy.mockResolvedValueOnce(null)

        // when
        resp = await controller.sendEmail({firstName: "Firstingon", lastName: "Lastington", emailAddress: "wow really bad!!!!", subject: "le hi", message: "el hola"})

        // then
        expect(manager.insert).toHaveBeenCalledTimes(0)
        expect(transporter.send).toHaveBeenCalledTimes(0)
        expect(resp.status).toEqual(400)
        expect(resp.message).toBeDefined()
    })

})