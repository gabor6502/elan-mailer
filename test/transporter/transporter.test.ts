import { Transporter } from "../../src/controller/Transporter"

describe("Transporter Email test", () => 
{
    it ("should send an email", async () => 
    {
        let transporter: Transporter = Transporter.getInstance()
        let success: boolean = true

        try
        {
            await transporter.send("First", "Last", "me@email.com", "subject test", "message to send")
        } catch (error)
        {
            success = false
        }

        expect(success).toBe(true)
    })
})