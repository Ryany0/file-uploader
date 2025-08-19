import express from "express";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import path from "path";
import passport from "./model/local-strategy.js";
import dotenv from "dotenv";

import prisma from "./model/prisma.js";
import logInRouter from "./route/log-in-router.js";
import signUpRouter from "./route/sign-up-router.js";
import folderRouter from "./route/folder-routes.js";

const __dirname = import.meta.dirname;
dotenv.config();
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

app.use(
    expressSession({
        cookie: {
            maxAge: 1000 * 60 * 60 * 24
        },
        secret: 'apples',
        resave: true,
        saveUninitialized: false,
        store: new PrismaSessionStore(
            prisma,
            {
                checkPeriod: 2 * 60 * 1000,
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined,
            }
        )
    })
);
app.use(passport.session());
app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    next();
});
app.get("/", async (req,res) => {
    res.locals.currentParent = null;
    res.locals.currentPath = req.path;
    if (req.isAuthenticated()) {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                folders: true,
            }
        });
        res.locals.folders = user.folders;
    }

    res.render("home");
});
app.use("/log-in", logInRouter);
app.use("/sign-up", signUpRouter);

app.use("/", folderRouter);


app.get("/log-out", (req,res,next) => {
    req.logOut((err) => {
        if(err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if(err) {
                return next(err);
            }
        });
        res.redirect("/");
    });
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("app listening on port ", PORT);
});