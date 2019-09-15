
import * as cluster from "cluster";
import express from "express";
import * as http from "http";
import * as os from "os";

import * as subapp from "./app";
import { logger } from "./utils/logger";

const app = express();
app.use("/", subapp.default);

const port = normalizePort(process.env.PORT || 5030);

function normalizePort(val: number | string): number | string | boolean {
  const portNumber: number = (typeof val === "string") ? parseInt(val, 10) : val;
  if (isNaN(portNumber)) { return val; } else if (portNumber >= 0) { return portNumber; } else { return false; }
}

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== "listen") { throw error; }
  const bind = (typeof port === "string") ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Get configured App server
app.set("port", port);

function gracefulShutdown(server1: http.Server): void {
  server1.close(() => {
    logger.info("gracefully shutting down :)");
    process.exit();
  });
}

// Initialize/create new http server
const numCPUs = os.cpus().length;

if (cluster.isMaster && (process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "production")) {
  logger.info(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    logger.info(`worker ${worker.process.pid} died`);
    if (Object.keys(cluster.workers).length === 0) {
      process.exit();
    }
  });

  cluster.on("listening", (worker, address) => {
    logger.info(`A worker is now connected to ${address.address}:${address.port}`);
  });
} else {
  // Workers can share any TCP connection. In this case it is an HTTP server
  const server = app.listen(port);
  server.timeout = 1200000;
  server.on("error", onError);
  server.on("listening", () => {
    const addr = server.address();
    let bind = "";
    if (typeof addr === "string") {
      bind = `pipe ${addr}`;
    } else if (typeof addr === "object" && addr !== null) {
      bind = `pipe ${addr.port}`;
    }
    logger.debug(`Listening on ${bind}`);
    logger.info(`Server started on worker process ${process.pid}, Listening on ${bind}`);
  });
  process.on("SIGINT", () => {
    gracefulShutdown(server);
  });
  process.on("SIGTERM", () => {
    gracefulShutdown(server);
  });
}

process.on("uncaughtException", (error) => {
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  // process.exit(1);
});

export default app;
