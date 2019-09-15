import { NextFunction, Request, Response, Router } from "express";
import { addUser, getUserById, getUserByMail } from "../controllers/user.controller";

export class UserRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.init();
  }

  public getUserById(request: Request, response: Response, next: NextFunction) {
    getUserById(request, response);
  }
  public searchUserByMail(request: Request, response: Response, next: NextFunction) {
    // TODO: Extent to include password validation
    // const userPassword: string = request.params.Password;
    getUserByMail(request, response);
  }
  public createUser(request: Request, response: Response, next: NextFunction) {
    addUser(request, response);
  }

  private init() {
    // Get User by Id. Ex: /user/24
    this.router.get("/user/:id", this.getUserById);
    // User Search. Ex: /user?Email=john.doe@mail.com&Password=test
    this.router.get("/user", this.searchUserByMail);
    this.router.post("/user", this.createUser);
  }
}

// Create the Router, and export its configured Express.Router
const userRoutes: UserRouter = new UserRouter();

const router = userRoutes.router;
export default router;
