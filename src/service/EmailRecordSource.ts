import { DataSource } from 'typeorm'
import { Record } from '../entity/Record'
/**
 * @name EmailRecordDataSource
 *
 * @description Properties of the data Source for the email record source.
 */
export const EmailRecordDataSource = new DataSource(
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
export const RecordManager = EmailRecordDataSource.manager

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

        console.log("Data source init!")
    } catch (error)
    {
        console.log("FAILED to init data source")
        console.log(error)
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

        console.log("Data source destroyed")
    } catch (error)
    {
        console.log("FAILED to destroy data source")
        console.log(error)
    }
    
}