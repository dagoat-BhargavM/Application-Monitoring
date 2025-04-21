import jsonServer from 'json-server';
import { Kafka } from "kafkajs";

const server = jsonServer.create();
const routes = jsonServer.router("db.json");
const middleware = jsonServer.defaults();

// Kafka setup
const kafka = new Kafka({
  clientId: "myserver",
  brokers: ["localhost:9092"],
});
const producer = kafka.producer();

// Connect Kafka producer at startup
const startKafka = async () => {
  await producer.connect();
};
startKafka();

const function_to_send_log = async (logMessage, topic) => {
  await producer.send({
    topic: topic,
    messages: [{ value: JSON.stringify(logMessage) }],
  });
};

// Middleware to log requests and response times
server.use(async (req, res, next) => {
  const requestTime = new Date();

  const logAndSendToKafka = () => {
    const responseTime = res.responseTime || new Date();
    const timeTakenMs = responseTime - requestTime;

    const logEntry = {
      method: req.method,
      url: req.url,
      body: req.body,
      time_taken: timeTakenMs,
      status: res.statusCode
    };

    console.log("Sending log to Kafka:", logEntry);

    if (res.statusCode >= 400) {
      function_to_send_log(logEntry, "error-logs");
    }

    function_to_send_log(logEntry, "total-monitoring");
  };

  // Override res.send() and res.end() to capture response time
  const originalSend = res.send;
  res.send = function (data) {
    res.responseTime = new Date();
    logAndSendToKafka();
    originalSend.apply(res, arguments);
  };

  const originalEnd = res.end;
  res.end = function (data) {
    res.responseTime = new Date();
    logAndSendToKafka();
    originalEnd.apply(res, arguments);
  };

  next();
});

server.use(middleware);
server.use(routes);

server.listen(3000, () => {
  console.log("JSON Server is running on http://localhost:3000");
});
