import "reflect-metadata"
import { initEmailRecordDataSource, destroyEmailRecordDataSource, RecordManager } from "./src/service/EmailRecordSource";

import { EmailRecordService } from "./src/service/EmailRecordService";
import { EmailController } from "./src/controller/EmailController";
import { Logger } from "./src/logger/Logger";
import { Transporter } from "./src/controller/Transporter";

const controller = new EmailController(new EmailRecordService(RecordManager, new Logger("Service")), Transporter.getInstance(), new Logger("Controller"))
const logger = new Logger("Server")

const express = require("express")

const app = express();
app.use(express.json()); // json middleware

var shutdown = false
var server

/**
 * @name Access-Control Middleware
 * 
 * @description Middleware setup for Access-Control-Allow props
 */
app.use((req, res, next) => 
{
    res.setHeader("Access-Control-Allow-Origin", "*"); // dev only, release repo will have proper domain name configured 
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
})

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
server = app.listen(process.env.PORT, async (error) => 
{
    if (error)
    {
        logger.error(error.message)
    }
    else
    {
        await initEmailRecordDataSource()

        logger.info(`Listening on port ${process.env.PORT}`)
        
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