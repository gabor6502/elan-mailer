import "reflect-metadata"
import { initEmailRecordDataSource } from "./src/service/EmailRecordSource";

const express = require('express')

const app = express();
const PORT = 6969

/**
 * @name send
 * 
 * @description Sends an email
 * 
 * @param body
 */
app.post('/send', async (request, response) => 
{
   console.log("whaddup")
})

/**
 * @description Server starts here. Inits DB then beings listening
 */
app.listen(PORT, async (error) => 
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