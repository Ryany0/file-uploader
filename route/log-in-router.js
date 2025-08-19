import { Router } from "express";
import * as logInController from "../controller/log-in-controller.js"
import passport from "passport";
const logInRouter = Router();

logInRouter.get("/", logInController.getLogInPage);
logInRouter.post("/", passport.authenticate("local", {successRedirect: "/", failureRedirect: "/log-in"}));


export default logInRouter;