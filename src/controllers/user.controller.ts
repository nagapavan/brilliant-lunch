// tslint:disable: object-literal-sort-keys

import { Request, Response } from "express";
import dbHelper from "../services/db.service";
import { logger } from "../utils/logger";

export function getUserById(request: Request, response: Response) {
  const userId: string = request.params.Id;
  dbHelper.query(`SELECT * FROM EndUser WHERE UsrId = ${userId};`)
    .then((result: any[]) => {
      const data = [];
      for (const user of result) {
        data.push({
          UserId: user.UsrId,
          // tslint:disable-next-line: object-literal-sort-keys
          FName: user.FName,
          LName: user.LName,
          CompanyId: user.OrganizationId,
          RoleId: user.RoleId,
          Email: user.Email,
          SignUpTime: user.SignUpTime,
        });
      }
      return response.status(200).send(data).end();
    })
    .catch((err) => {
      return response.status(500).send({
        Message: "Invalid UserId",
        error: err,
      }).end();
    });
}
export function getUserByMail(request: Request, response: Response) {
  const userMail: string = request.query.Email;
  const mailQuery = `SELECT UsrId from Log_In where Email LIKE '${userMail}';`;
  dbHelper.query(mailQuery)
    .then((result: any[]) => {
      if (result[0] !== undefined) {
        const userId = result[0].UsrId;
        const userDetailsQuery = `SELECT EndUser.* , Organization.Name as Company,MapRole.RoleName as Role,Log_In.Password as Password FROM EndUser INNER JOIN Organization ON EndUser.OrganizationId = Organization.OrganizationId INNER JOIN MapRole ON EndUser.RoleId = MapRole.RoleId  INNER JOIN Log_In ON Log_In.UsrId = EndUser.UsrId WHERE UsrId =${userId};`;
        dbHelper.query(userDetailsQuery)
          .then((detailResult: any[]) => {
            const userList = [];
            logger.info("detailResult" + detailResult.length);
            for (const user of detailResult) {
              userList.push({
                UserId: user.UsrId,
                FName: user.FName,
                LName: user.LName,
                OrganizationId: user.OrganizationId,
                RoleId: user.RoleId,
                Email: user.Email,
                SignUpTime: user.SignUpTime,
                Organization: user.Company,
                Role: user.Role,
                Password: user.Password,
              });
            }
            logger.debug("data" + JSON.stringify(userList));
            return response.status(200).send(userList).end();
          })
          .catch((err) => {
            return response.status(500).send([{
              Message: `Invalid Credentials - userId: ${userId}`,
              error: err,
            }]).end();
          });
      }

      const data = [];
      for (const user of result) {
        data.push({
          UserId: user.UsrId,
          FName: user.FName,
          LName: user.LName,
          CompanyId: user.OrganizationId,
          RoleId: user.RoleId,
          Email: user.Email,
          SignUpTime: user.SignUpTime,
        });
      }
      return response.status(200).send(data).end();
    })
    .catch((err) => {
      return response.status(500).send([{
        Message: "Invalid Credentials",
        error: err,
      }]).end();
    });
}

export function addUser(request: Request, response: Response) {
  const jsondata = request.body;

  logger.info("request" + JSON.stringify(jsondata));

  const insertQuery = `INSERT INTO dbBh.EndUser(FName,LName,OrganizationId,RoleId,Email,SignUpTime)values('${jsondata.FName}','${jsondata.LName}', ${jsondata.CompanyId}, ${jsondata.RoleId},' ${jsondata.Email}','${jsondata.SignUpTime}');`;

  dbHelper.query(insertQuery)
    .then((insertResponse) => {
      const getIdQuery = "SELECT UsrId FROM EndUser WHERE Email LIKE '${jsondata.Email}';";
      dbHelper.query(getIdQuery)
        .then((result) => {
          const userid = result[0].UsrId;
          logger.info("userid: " + userid);
          const loginCredsInsert = `INSERT INTO dbBh.Log_In(Email,Password,UsrId)values('${jsondata.Email}','${jsondata.Password}',${userid};`;
          dbHelper.query(loginCredsInsert)
            .then((credInsertResponse) => {
              const data = [];
              data.push({
                Message: "User Created Successfully",
                UserId: userid,
              });
              return response.status(200).send(data).end();
            })
            .catch((err) => {
              logger.error(JSON.stringify(err));
              return response.status(500).send([{
                Message: "User Creation Failed - Unable to add credentials",
                error: err,
              }]).end();
            });
        })
        .catch((err) => {
          logger.error(JSON.stringify(err));
          return response.status(500).send([{
            Message: "User Creation Failed - Unable to fetch created user",
            error: err,
          }]).end();
        });
    })
    .catch((err) => {
      logger.error(JSON.stringify(err));
      return response.status(500).send([{
        Message: "User Creation Failed",
        error: err,
      }]).end();
    });
}
