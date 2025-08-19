import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"
import bcrypt from "bcrypt";
import prisma from "./prisma.js";

const options = {
    usernameField: 'email'
}

passport.use(
    new LocalStrategy(options, async (email, password, done) => {
        try {

            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                }
            });
            if (!user) {;
                return done(null, false, {message: "incorrect credintals"});
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return done(null, false, {message: "Incorrect credentials"});
            }
            return done(null, user);

        } catch(err) {
            return done(err);
        }
    })
);

passport.serializeUser((user,done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            }
        });
        if (!user) throw new Error("User Not Found");
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;