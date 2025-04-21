import { Kafka } from "kafkajs";
import mysql from "mysql2/promise";

// MySQL Connection
const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Bangalore@01",
    database: "appmonitor",
});

// Kafka Consumer Setup
const kafka = new Kafka({
    clientId: "mysql-consumer",
    brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "log-group" });

const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topics: ["error-logs", "total-monitoring"], fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                if (!message.value) {
                    console.warn("Received empty message, skipping...");
                    return;
                }

                let logMessage;
                try {
                    logMessage = JSON.parse(message.value.toString());
                } catch (parseError) {
                    console.error("Invalid JSON message:", message.value.toString());
                    return;
                }

                const { method, url, body, time_taken, status } = logMessage;

                // Check for required fields
                if (!method || !url || status === undefined) {
                    console.warn("Missing required fields in log message:", logMessage);
                    return;
                }

                // Ensure time_taken is not undefined
                const timeTakenValue = time_taken !== undefined ? time_taken : null;

                // Insert into logs table
                await db.execute(
                    `INSERT INTO logs (method, url, body, time_taken, status) VALUES (?, ?, ?, ?, ?)`,
                    [method, url, JSON.stringify(body), timeTakenValue, status]
                );

                console.log("Inserted log into logs table");

                // If status code is 400 or higher, also insert into error_logs
                if (status >= 400) {
                    await db.execute(
                        `INSERT INTO only_errors (method, url, body, time_taken, status) VALUES (?, ?, ?, ?, ?)`,
                        [method, url, JSON.stringify(body), timeTakenValue, status]
                    );
                    console.log("Inserted log into error_logs table");
                }

            } catch (error) {
                console.error("Error processing message:", error);
            }
        },
    });
};

run().catch(console.error);
