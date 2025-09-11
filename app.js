import "reflect-metadata"
import { initEmailRecordDataSource, destroyEmailRecordDataSource, RecordManager } from "./src/service/EmailRecordSource";

import { EmailRecordService } from "./src/service/EmailRecordService";
import { EmailControler } from "./src/controller/EmailController";

const controller = new EmailControler(new EmailRecordService(RecordManager))

const express = require('express')

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
    let res = await controller.sendEmail(request.body)

    response.status(res.status)
    response.json(res.message)
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
        console.log(error.message)
    }
    else
    {
        await initEmailRecordDataSource()

        console.log(`Listening on port ${PORT}`)
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
            console.log("Shutting down server")

            await destroyEmailRecordDataSource()

            process.exit(0)
        })
    }
})