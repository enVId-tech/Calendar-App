/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Express } from "express";
import {
    APP_HOSTNAME,
    SERVER_PORT,
    CLIENT_ID,
    CLIENT_SECRET,
    URI,
} from "./modules/env";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import connectMongoDBSession from "connect-mongodb-session";
import cors from "cors";
import dotenv from "dotenv";
import {
    generateRandomNumber,
    permanentEncryptPassword,
} from "./modules/encryption";
import { getItemsFromDatabase, writeToDatabase } from "./modules/mongoDB";
import encrypts from "./modules/encryption";
import httpProxy from "http-proxy";

const proxy = httpProxy.createProxyServer();

const MongoDBStore = connectMongoDBSession(session);

const app: Express = express();

app.use("/api", (req, res) => {
    proxy.web(req, res, { target: "http://localhost:3001" });
});

app.use(express.json());
app.use(cors());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));
app.set("trust proxy", true);

// Credentials
dotenv.config({ path: "./modules/credentials.env.local" });

// Secret
const SECRET: string = permanentEncryptPassword(
    generateRandomNumber(256, "alphanumeric").toString()
);

app.use(
    session({
        secret: SECRET,
        resave: false,
        saveUninitialized: true,
        store: new MongoDBStore({
            uri: process.env.MONGODB_URI!,
            databaseName: process.env.CLIENT_DB,
            collection: "sessions",
            expires: 1000 * 60 * 60 * 24 * 31, // 1 month
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 3.5, // 3.5 days
        },
    })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Requests for the Google OAuth2.0 login page
passport.serializeUser((user, done) => {
    done(null, user);
});

// Requests for the Google OAuth2.0 login page
passport.deserializeUser((user, done) => {
    return done(null, user as false | Express.User | null | undefined);
});

passport.use(
    // @ts-expect-error Google Strategy error is a false positive
    new GoogleStrategy(
        {
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
    "/auth/google/callback",
    passport.authenticate("google"),
    async (req, res) => {
        try {
            const userProfile: GoogleStrategy.Profile =
                req.user as GoogleStrategy.Profile;

            console.log("User profile:\n", userProfile);

            if (!userProfile) {
                throw new Error("No user profile found");
            }

            const fileData = JSON.parse(await getItemsFromDatabase("users"));

            if (!fileData) {
                throw new Error("No data found");
            }

            let user = fileData.find(
                (item) => item.email === userProfile.emails![0].value
            );

            res.cookie("user", userProfile.emails![0].value, {
                maxAge: req.session!.cookie.maxAge,
                httpOnly: true,
            });
            res.cookie("name", userProfile.displayName, {
                maxAge: req.session!.cookie.maxAge,
                httpOnly: true,
            });

            if (!user) {
                const newUser = {
                    displayName: userProfile.displayName,
                    firstName: userProfile.name!.givenName,
                    lastName: userProfile.name!.familyName,
                    email: encrypts.encryptData(
                        userProfile.emails![0].value,
                        "aes-256-gcm"
                    ),
                    profilePicture: userProfile.photos![0].value,
                    hd: userProfile._json.hd,
                    calendar: {},
                    userId: await generateRandomNumber(64, "alphanumeric"),
                    session: req.sessionID,
                    prevSession: req.sessionID,
                    latestSession: new Date(),
                };

                await writeToDatabase("users", newUser);
                user = newUser;
            } else {
                user.latestSession = new Date();

                await writeToDatabase("users", user);
            }
            res.redirect("http://localhost:5173");
        } catch (error: unknown) {
            console.error("Error:", error);
        }
    }
);

app.get("/auth/logout", (req, res) => {
    req.session!.destroy(() => {
        res.redirect("/");
    });
});

app.post("/calendar/user/data", async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            throw new Error("No data found");
        }

        await getItemsFromDatabase("calendar", true, { email: data.userId });

        res.status(200).json({ status: 200, message: "Data saved" });
    } catch (error: unknown) {
        console.error("Error:", error);
    }
});

app.post("/credentials/logout", async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            throw new Error("No data found");
        }

        await getItemsFromDatabase("users", true, { session: req.sessionID });

        req.session.destroy(() => {
            res.redirect("/");
        });

        res.status(200).json({ status: 200, message: "Logged out" });
    } catch (error: unknown) {
        console.error("Error:", error);
    }
});

app.listen(SERVER_PORT, () => {
    console.log(`Server is running at http://${APP_HOSTNAME}:${SERVER_PORT}`);
});
