import "reflect-metadata"
import { initEmailRecordDataSource } from "./src/service/EmailRecordSource";

//require('dotenv').config()

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
   response.status(200)
   response.send({body: "hi!"})
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