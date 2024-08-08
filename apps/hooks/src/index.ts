import express, { Request, Response } from "express"
import prisma from "db/prisma";

const app = express();
app.use(express.json());

// https://hooks.zapier.com/hooks/catch/17043103/22b8496/
// password logic
app.post("/hooks/catch/:userId/:zapId", async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;

    console.log("reaqched here");
    // store in db a new trigger
    await prisma.$transaction(async tx => {
        console.log("reaqched here 2");
        const run = await tx.zapRun.create({
            data: {
                zapId: zapId,
                metadata: body
            }
        });
        console.log("reaqched here 3");

        await tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id
            }
        })
    })
    res.json({
        message: "Webhook received"
    })
})

app.listen(3000, () => {
    console.log("Hook started")
});