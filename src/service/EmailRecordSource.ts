import { DataSource, EntityManager } from "typeorm"
import { Record } from "../entity/Record"
import { Logger } from "../logger/Logger"

const logger = new Logger("Data source")

/**
 * @name EmailRecordDataSource
 *
 * @description Properties of the data Source for the email record source.
 */
export const EmailRecordDataSource: DataSource = new DataSource(
{
    type: 'postgres',
    host: process.env.DB_HOST ,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Record]

    // for init sync, run (** indicates value in .env file for you to set):
    // npx cross-env DB_USERNAME=** DB_PASSWORD=** DB_PORT=** DB_HOST=** DB_NAME=** typeorm schema:sync -d .\build\src\service\EmailRecordSource.js
    // dependency: cross-env
})

/**
 * @name RecordManager
 * 
 * @description Entity Manager for records 
 */
export const RecordManager: EntityManager = EmailRecordDataSource.manager

/**
 * @name initEmailRecordDataSource
 * 
 * @description Initializes the data source
 * 
 * @returns Promise<void>
 */
export async function initEmailRecordDataSource(): Promise<void>
{
    try
    {
        await EmailRecordDataSource.initialize()

        logger.info("Data source init!")
    } catch (error)
    {
        logger.error("FAILED to init data source: "+error)
    }
}

/**
 * @name destroyEmailRecordDataSource
 * 
 * @description Closes and destroys resources associated with the data source
 * 
 * @retruns Promise<void>
 */
export async function destroyEmailRecordDataSource(): Promise<void>
{
    try
    {
        EmailRecordDataSource.destroy()

        logger.info("Data source destroyed")
    } catch (error)
    {
        logger.error("FAILED to destroy data source "+error)
    }
    
}