import { validationResult, body, matchedData } from "express-validator";
import bcrypt from "bcrypt";
import prisma from "../model/prisma.js";

const saltRounds = 10;

const emailExist = async (value) => {
    const user = await prisma.user.findUnique({
        where: {
            email: value,
        }
    })
    if (user) {
        throw new  Error("Email is in use.");
    }
}

const passwordMatchs = (value, { req }) => {
    return value === req.body.password;
}

export const validateSinUpData = [
    body("email").trim()
    .notEmpty().escape()
    .isEmail().normalizeEmail({all_lowercase: true})
    .custom(emailExist),

    body("name").trim()
    .notEmpty().escape()
    .isLength({max: 40}),

    body("password").notEmpty().escape()
    .isLength({min: 1}).withMessage("Password must have a minimum length of 1"),

    body("confirm-password").custom(passwordMatchs).withMessage("Passwords must match.")
]

export function getSignUpPage(req,res) {
    res.render("sign-up");
}

export async function createUser(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render("sign-up", {
            errors: errors.array(),
        });
    }
    const data = matchedData(req);

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    //add user to db
    const user = await prisma.user.create({
        data: {
            email: data.email,
            name: data.name,
            password: hashedPassword
        }
    });
    console.log(user);
    res.redirect("/");
    
}
