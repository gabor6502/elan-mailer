import { EntityManager } from "typeorm"
import { Logger } from "../../src/logger/Logger"

jest.mock("../../src/logger/logger")
jest.mock("typeorm", () => 
{
  const actual = jest.requireActual("typeorm");
  return {
    ...actual,
    EntityManager: jest.fn().mockImplementation(() => { return { insert: jest.fn(), findOneBy: jest.fn() }})
  }
});


describe("Controller and Service Integration Test", () => 
{

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
    })

    it("", () => 
    {

    })
})