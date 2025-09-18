import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import console from "node:console";
import { User } from "./models/user.ts";
import { usersRouter } from "./apis/users/router.ts";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../common/errors.ts";
import bodyParser from "body-parser";
import cookieSession from "cookie-session";
import process from "node:process";
import { authRouter } from "./apis/auth/router.ts";

const app = express();
const port = 3000;

function initApp() {
  initDb();

  app.use(bodyParser.json());
  app.use(
    cookieSession({
      name: "session",
      keys: [process.env["SECRET_KEY"]!, "other keys"],
    }),
  );

  app.use("/users", usersRouter);
  app.use("/auth", authRouter);

  app.use(
    (
      error: Error,
      _request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      if (error instanceof NotFoundError) {
        response.status(404).json({
          error: { message: "Resource not found." + " " + error.message },
        });
      } else if (
        error instanceof ValidationError ||
        error instanceof BadRequestError
      ) {
        response.status(400).json({
          error: { message: "Request is invalid." + " " + error.message },
        });
      } else if (error instanceof UnauthorizedError) {
        response.status(401).json({
          error: { message: "Access restricted." + " " + error.message },
        });
      }

      next();
    },
  );

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

function initDb() {
  User.sync({ alter: true });
}

initApp();
