import prisma from "db/prisma";
import { Kafka } from "kafkajs";

const TOPIC_NAME = "zap-events-2";
const kafka = new Kafka({
    clientId: "outbox-processor",
    brokers: ['localhost:9092']
})

async function main() {
    const producer = kafka.producer();
    await producer.connect();
    while (true) {
        const pendingRows = await prisma.zapRunOutbox.findMany({
            where: {

            },
            take: 10
        })

        producer.send({
            topic: TOPIC_NAME,
            messages: pendingRows.map((row) => {
                console.log("Here")
                return {
                    value: row.zapRunId
                }
            })
        })

        await prisma.zapRunOutbox.deleteMany({
            where: {
                id: {
                    in: pendingRows.map(x => x.id)
                }
            }
        })
        await new Promise(r => setTimeout(r, 5000));
    }
}

main()