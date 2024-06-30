import express, { Express, Request, Response, NextFunction } from "express";
import {
    APP_HOSTNAME,
    SERVER_PORT,
    CLIENT_ID,
    CLIENT_SECRET,
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
import {
    deleteFromDatabase,
    getItemsFromDatabase,
    modifyInDatabase,
    writeToDatabase,
} from "./modules/mongoDB";
import { createProxyMiddleware } from "http-proxy-middleware";
import { EventsData } from "./modules/interface";

const MongoDBStore = connectMongoDBSession(session);
const app: Express = express();

app.use(express.json());
app.use(cors({ origin: `http://${APP_HOSTNAME}:${CLIENT_PORT}`, credentials: true }));
app.set("trust proxy", true);

dotenv.config({ path: "./modules/credentials.env.local" });

const SECRET: string = permanentEncryptPassword(
    generateRandomNumber(256, "alphanumeric").toString()
);

// Middleware to check for session cookie
const checkSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionId = req.sessionID;

        if (sessionId) {
            const fileData = JSON.parse(await getItemsFromDatabase("users", { session: sessionId }));

            if (fileData && fileData.length === 1) {
                return res.status(200).json({ status: 200, message: "Session ID found" });
            } else if (fileData && fileData.length > 1) {
                await deleteFromDatabase({ session: sessionId }, "sessions", "many");

                for (const item of fileData) {
                    item.session = null;
                    await modifyInDatabase({ email: item.email }, item, "users");
                }

                return res.status(401).json({ status: 401, message: "Overutilized Session ID" });
            }
        }
        next();
    } catch (error) {
        console.error("Error:", error);
        next();
    }
};

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
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 3.5, // 3.5 days
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user as false | Express.User | null | undefined);
});

passport.use(
    // @ts-expect-error - This is a valid strategy
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

            if (!userProfile) {
                throw new Error("No user profile found");
            }

            const fileData = JSON.parse(await getItemsFromDatabase("users"));

            if (!fileData) {
                throw new Error("No data found");
            }

            console.log(userProfile.emails![0].value);
            console.log(fileData);

            let user = fileData.find(
                (item) => item.email === userProfile.emails![0].value
            ) || null;

            if (!user) {
                const newUser = {
                    displayName: userProfile.displayName,
                    firstName: userProfile.name!.givenName,
                    lastName: userProfile.name!.familyName,
                    email: userProfile.emails![0].value,
                    profilePicture: userProfile.photos![0].value,
                    hd: userProfile._json.hd,
                    userId: await generateRandomNumber(64, "alphanumeric"),
                    session: req.sessionID,
                    latestSession: new Date(),
                };

                await writeToDatabase("users", newUser);
                user = newUser;
            } else {
                user.latestSession = new Date();
                delete user._id;
                await modifyInDatabase({ email: user.email }, user, "users");
            }

            res.cookie("userId", user.userId, {
                maxAge: 1000 * 60 * 60 * 24 * 3.5, // 3.5 days
                httpOnly: false,
            });

            res.redirect(`http://${APP_HOSTNAME}:${CLIENT_PORT}`);
        } catch (error: unknown) {
            console.error("Error:", error as string);
        }
    }
);

app.get("/auth/logout", (req, res) => {
    try {
        req.session!.destroy(() => {
            res.redirect(`http://${APP_HOSTNAME}:${CLIENT_PORT}`);
        });
        res.redirect(`http://${APP_HOSTNAME}:${CLIENT_PORT}`);
    } catch (error: unknown) {
        console.error("Error:", error as string);
    }
});

app.get("/login/guest", async (req, res) => {
    try {
        const fileData = JSON.parse(await getItemsFromDatabase("users"));

        if (!fileData) {
            throw new Error("No data found");
        }

        res.cookie("userId", "guest", {
            maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day
            httpOnly: true,
        });

        res.redirect(`http://${APP_HOSTNAME}:${CLIENT_PORT}`);
    } catch (error: unknown) {
        console.error("Error:", error);
    }
});

app.get("/login", checkSession, (req, res) => {
    if (req.sessionID) {
        console.log("Session ID:", req.sessionID);
    } else {
        console.log(req);
    }

    res.status(200).send("Login page requested");
});

app.post("/calendar/user/data", async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            throw new Error("No data found");
        }

        await getItemsFromDatabase("calendar", { userId: data.userId });

        res.status(200).json({ status: 200, message: "Data saved" });
    } catch (error: unknown) {
        console.error("Error:", error);
    }
});

app.post("/post/user", async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            throw new Error("No data found");
        }

        console.log(data.userId);

        const fileData = JSON.parse(await getItemsFromDatabase("users", { userId: data.userId }));

        if (!fileData || fileData.length === 0) {
            throw new Error("No data found");
        } else if (fileData.length > 1) {
            throw new Error("Multiple data found");
        }

        if (fileData[0]._id) {
            delete fileData[0]._id;
        }

        if (fileData[0].session) {
            delete fileData[0].session;
        }

        if (fileData[0].userId) {
            delete fileData[0].userId;
        }

        res.status(200).json(fileData);
    } catch (error: unknown) {
        console.error("Error:", error);
    }
});

app.post("/post/events", async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            throw new Error("No data found");
        }

        const fileData: EventsData = JSON.parse(await getItemsFromDatabase("events", { userId: data.userId }));

        console.log(fileData);

        if (fileData.length === 0) {
            fileData.events = data.events;

            await modifyInDatabase({ userId: data.userId }, fileData, "events");
        } else {
            const newEvents: EventsData = {
                userId: data.userId,
                events: data.events,
            };

            await writeToDatabase("events", newEvents);
        }

        res.status(200).json({ status: 200, message: "Events saved" });
    } catch (error: unknown) {
        console.error("Error:", error);
    }
});

app.post("/post/delete", async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            throw new Error("No data found");
        }

        const deleted = await deleteFromDatabase({ userId: data.userId }, "users", "one");

        if (!deleted) {
            res.status(404).json({ status: 404, message: "No data found" });
            throw new Error("No data found or error occurred");
        }

        res.status(200).json({ status: 200, message: "Data deleted" });
    } catch (error: unknown) {
        console.error("Error:", error);
    }
});

app.post("/get/events", async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            throw new Error("No data found");
        }

        const fileData = JSON.parse(await getItemsFromDatabase("events", { userId: data.userId }));

        if (!fileData) {
            res.status(200).json({ status: 200, message: "No events found" });
        } else {
            res.status(200).json(fileData);
        }
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

        await getItemsFromDatabase("users", { userId: data.userId });

        req.cookies = null;

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

const proxyVar = createProxyMiddleware(proxyOptions);

app.use("/", proxyVar);

app.listen(SERVER_PORT, () => {
    console.log(`Server is running at http://${APP_HOSTNAME}:${SERVER_PORT}`);
});
