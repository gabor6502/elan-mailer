import "reflect-metadata"
import { initEmailRecordDataSource, destroyEmailRecordDataSource, RecordManager } from "./src/service/EmailRecordSource";

import { EmailRecordService } from "./src/service/EmailRecordService";
import { EmailControler } from "./src/controller/EmailController";
import { Logger } from "./src/logger/logger";

const controller = new EmailControler(new EmailRecordService(RecordManager))
const logger = new Logger("Server")

const express = require("express")

const app = express();
app.use(express.json()); // json middleware

const PORT = 6969

var shutdown = false
var server

/**
 * @name send
 * 
 * @description Sends an email
 * 
 * @param body
 */
app.post('/send', async (request, response) => 
{
    logger.info("Received POST request on \"/send\"")

    let res = await controller.sendEmail(request.body)

    response.status(res.status)
    response.json(res.message)

    logger.info(`\"/send\" response sent with code ${res.status} and message \"${res.message}\"`)
})

/**
 * @description Server starts here. Inits DB then beings listening
 * 
 * @returns Server instance
 */
server = app.listen(PORT, async (error) => 
{
    if (error)
    {
        logger.error(error.message)
    }
    else
    {
        await initEmailRecordDataSource()

        logger.info(`Listening on port ${PORT}`)
    }
})

/**
 * @description Destroys database connection before server shutdown on ctrl-c
 */
process.once("SIGINT", async () => 
{
    if (!shutdown) // precent multiple shutdown runs because of spamming keys, only need to do this once
    {
        shutdown = true

        await server.close(async () => 
        {
            logger.info("Shutting down server")

            await destroyEmailRecordDataSource()

            logger.info("End of processing")
            process.exit(0)
        })
    }
})