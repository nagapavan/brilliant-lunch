import * as bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import errorHandler from "errorhandler";
import express from "express";
import * as helmet from "helmet";
import hpp from "hpp";

import userRoutes from "./routes/user.routes";
import dbHelper from "./services/db.service";
import { logger } from "./utils/logger";

dbHelper.testClient()
  .then((info: any) => {
    logger.debug(JSON.stringify(info));
  })
  .catch((error: any) => {
    logger.error("Error connecting to DB", error);
    process.exit(1);
  });

class App {
  // ref to Express instance
  public server: express.Application;

  // Run configuration methods on the Express instance.
  constructor() {
    this.server = express();
    this.middleware();
    this.routes();
    this.errorHandlers();
  }

  // Configure Express middleware.
  private middleware(): void {
    // Security configurations - Start
    // this.server.use(helmet.contentSecurityPolicy());
    this.server.use(helmet.dnsPrefetchControl());
    this.server.use(helmet.noSniff());
    this.server.use(helmet.frameguard({
      action: "deny",
    }));
    this.server.use(helmet.hidePoweredBy());
    this.server.use(helmet.hsts());
    this.server.use(helmet.ieNoOpen());
    this.server.use(helmet.noSniff());
    this.server.use(helmet.xssFilter());

    // this.server.use(csrf());

    this.server.use(hpp());

    this.server.disable("x-powered-by");
    // Security configurations - END

    this.server.use(bodyParser.json({ limit: "100mb" }));
    this.server.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

    this.server.use(compression());

    const corsOptions: any = {
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type",
        "Accept"],
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      optionsSuccessStatus: 204,
      origin: "*",
    };

    this.server.use(cors(corsOptions));

    this.server.use((req, res, next) => {
      // intercepts OPTIONS method
      if ("OPTIONS" === req.method) {
        // respond with 200
        return res.send(200);
      }
      // else move on
      return next();
    });

  }

  // Configure API endpoints.
  private routes(): void {
    this.server.use("/", userRoutes);
  }

  private errorHandlers(): any {
    this.server.use(errorHandler);
  }
}
const app: express.Application = new App().server;
export default app;
