import { EmailController, EmailResponse } from "../../src/controller/EmailController"
import { Transporter } from "../../src/controller/Transporter"
import { EmailRecordService } from "../../src/service/EmailRecordService"
import { Logger } from "../../src/logger/logger"

jest.mock("../../src/logger/logger")
jest.mock("../../src/service/EmailRecordService")
class MockedTransporter extends Transporter // singleton mock that will suffice for now
{
    constructor() { super() }
    // override
    async send(firstName: string, lastName: string, emailAddress: string, subject: string, message: string): Promise<any> { /* do nothing */ }
}

describe("Score Controller Tests", () => 
{
    var controller: EmailController

    var logger: jest.Mocked<Logger>
    var transporter: MockedTransporter
    var service: jest.Mocked<EmailRecordService>

    beforeAll(() => 
    {
        logger = new (<new () => Logger>Logger)() as jest.Mocked<Logger>
        logger.info.mockImplementation(()=>{})
        logger.error.mockImplementation(()=>{})

        transporter = new MockedTransporter()

        service = new (<new () => EmailRecordService>EmailRecordService)() as jest.Mocked<EmailRecordService>

        controller = new EmailController(service, transporter, logger)
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

