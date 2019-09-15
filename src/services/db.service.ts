import { Connection, createConnection } from "mysql";
import { envConfig } from "../env.config";
import { logger } from "../utils/logger";

export class MySqlHelper {
  private connection: Connection;
  constructor() {
    this.connection = createConnection({
      database: envConfig.credentials.database,
      host: envConfig.credentials.host,
      password: envConfig.credentials.password,
      user: envConfig.credentials.userid,
    });

  }

  public testClient() {
    return new Promise((resolve, reject) => {
      this.connection.connect((err, connectionInfo) => {
        if (err) {
          return reject(err);
        }
        resolve(connectionInfo);
      });
    });
  }

  public query(sqlQuery: string, queryArgs?: any) {
    return new Promise<any[]>((resolve, reject) => {
      const args: any = queryArgs || {};
      logger.info("Processing Query");
      this.connection.query(sqlQuery, args, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
  public close() {
    return new Promise((resolve, reject) => {
      logger.info("Closing DB Connection");
      this.connection.end((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * getClient
   */
  public getClient(): Connection {
    return this.connection;
  }
}

const dbHelper = new MySqlHelper();

export default dbHelper;
