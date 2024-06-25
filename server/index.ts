/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Express } from "express";
import {
    APP_HOSTNAME,
    SERVER_PORT,
    CLIENT_ID,
    CLIENT_SECRET,
    URI,
    CLIENT_PORT,
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
import { createProxyMiddleware } from 'http-proxy-middleware';

const proxy = httpProxy.createProxyServer();

const MongoDBStore = connectMongoDBSession(session);

const app: Express = express();

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

                res.cookie("userId", newUser.userId, {
                    maxAge: 1000 * 60 * 60 * 24 * 3.5, // 3
                    httpOnly: true,
                });
            } else {
                // user.latestSession = new Date();

                // res.cookie("userId", user.userId, {
                //     maxAge: 1000 * 60 * 60 * 24 * 3.5, // 3
                //     httpOnly: true,
                // });

                // await writeToDatabase("users", user);
            }

            res.redirect(`http://${APP_HOSTNAME}:${CLIENT_PORT}`);
        } catch (error: unknown) {
            console.error("Error:", error);
        }
    }
);

app.get("/auth/logout", (req, res) => {
    // req.session!.destroy(() => {
    //     res.redirect("/api/");
    // });
    res.redirect(`http://${APP_HOSTNAME}:${CLIENT_PORT}`);
});

app.get("/login/guest", async (req, res) => {
    try {
        const fileData = JSON.parse(await getItemsFromDatabase("users"));

        if (!fileData) {
            throw new Error("No data found");
        }

        const oneTimeUser = {
            displayName: "Guest",
            firstName: "Guest",
            lastName: "Guest",
            email: "guest@localhost",
            profilePicture: "https://via.placeholder.com/150",
            hd: "localhost",
            calendar: {},
            userId: await generateRandomNumber(64, "alphanumeric"),
            session: req.sessionID,
            prevSession: req.sessionID,
            latestSession: new Date(),
        }

        await writeToDatabase("users", oneTimeUser);

        res.redirect(`http://${APP_HOSTNAME}:${CLIENT_PORT}`);
    } catch (error: unknown) {
        console.error("Error:", error);
    }
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
            return res.status(400).json({ status: 400, message: "No data found" });
        }

        await getItemsFromDatabase("users", true, { session: req.sessionID });

        req.session.destroy((err) => {
            if (err) {
                console.error("Session destruction error:", err);
                return res.status(500).json({ status: 500, message: "Error during logout" });
            }
            res.status(200).json({ status: 200, message: "Logged out" });
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 500, message: "Internal server error" });
    }
});

// Proxy (to the client, on port 5173)
const proxyOptions = {
    target: `http://${APP_HOSTNAME}:${CLIENT_PORT}`,
    changeOrigin: true,
    ws: true, // Enable WebSocket proxying
  };
  
  // Create the proxy middleware
  const proxyVar = createProxyMiddleware(proxyOptions);
  
  // Use the proxy for all routes
  app.use('/', proxyVar);
  

app.listen(SERVER_PORT, () => {
    console.log(`Server is running at http://${APP_HOSTNAME}:${SERVER_PORT}`);
});
