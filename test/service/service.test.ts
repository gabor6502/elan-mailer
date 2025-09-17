import { CharacterLimitError, EmailFormatError, EmailRecordService } from "../../src/service/EmailRecordService"
import { EntityManager } from "typeorm"
import { Logger } from "../../src/logger/Logger"
import { MAX_CHARS } from "../../src/entity/Record";

jest.mock("../../src/logger/logger")
jest.mock("typeorm", () => 
{
  const actual = jest.requireActual("typeorm");
  return {
    ...actual,
    EntityManager: jest.fn().mockImplementation(() => { return {insert: jest.fn(), findOneBy: jest.fn()}})
  }
});

describe("Email Record Service tests: ", () =>
{
    var service: EmailRecordService
    var logger: jest.Mocked<Logger>
    var recordManager: jest.Mocked<EntityManager>

    beforeEach(() => 
    {
        
        logger = new (<new () => Logger>Logger)() as jest.Mocked<Logger>
        jest.spyOn(logger, "info").mockImplementation(() => {})
        jest.spyOn(logger, "error").mockImplementation(() => {})
        
        recordManager = new (<new () => EntityManager>EntityManager)() as jest.Mocked<EntityManager>
        service = new EmailRecordService(recordManager, logger)
    })
    
    it("should insert a record", async () => 
    {
        // when
        await service.addRecord("Tester", "McTesting", "test@testmail.com") // all valid params

        // then
        expect(recordManager.insert).toHaveBeenCalled()
    })

    it("should fail to insert due to improper email", async () => 
    {
        let thrown: any = null

        // when
        try
        {
            await service.addRecord("Tester", "McTesting", "horrible email dot com") // bad email
        } catch(error)
        {
            thrown = error
        }
        
        // then
        expect(thrown instanceof EmailFormatError).toBe(true)
        expect(recordManager.insert).toHaveBeenCalledTimes(0)
    })

    it("should fail to insert due to max chars limit", async () =>
    {
        let thrown: any = null
        let maxedOut: string = ""

        // given
        for (let i =0; i <= MAX_CHARS; i++)
        {
            maxedOut += 'e'
        }

        // when
        try
        {
            await service.addRecord(maxedOut, "LastNameEver", "my@email.com") // bad email
        } catch(error)
        {
            thrown = error
        }
        
        // then
        expect(thrown instanceof CharacterLimitError).toBe(true)
        expect(recordManager.insert).toHaveBeenCalledTimes(0)
    })

})