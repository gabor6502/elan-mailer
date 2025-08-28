import "reflect-metadata"
import { initEmailRecordDataSource, destroyEmailRecordDataSource, RecordManager } from "./src/service/EmailRecordSource";

import { EmailRecordService } from "./src/service/EmailRecordService";
import { EmailControler } from "./src/controller/EmailController";

const controller = new EmailControler(new EmailRecordService(RecordManager))

const express = require('express')

const app = express();
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
    await controller.sendEmail()

    response.status(200)
    response.json({message: "sent an email"})
})

/**
 * @description Server starts here. Inits DB then beings listening
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

process.once("SIGINT", async () => 
{
    if (!shutdown)
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