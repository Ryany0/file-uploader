import { Router } from "express";
import * as signUpController from "../controller/sign-up-controller.js";
const signUpRouter = Router();

signUpRouter.get("/", signUpController.getSignUpPage);
signUpRouter.post("/", [signUpController.validateSinUpData, signUpController.createUser]);

export default signUpRouter;