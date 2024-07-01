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
import encrypts, {
    comparePassword,
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
import cookieParser from "cookie-parser";

const MongoDBStore = connectMongoDBSession(session);
const app: Express = express();

app.use(express.json());
app.use(cors({ origin: `http://${APP_HOSTNAME}:${CLIENT_PORT}`, credentials: true }));
app.set("trust proxy", true);
app.use(cookieParser());

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

app.post("/login/user", async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            throw new Error("No data found");
        }

        const fileData = JSON.parse(await getItemsFromDatabase("users", { email: data.username }));

        console.log(fileData);

        if (!fileData || fileData.length === 0) {
            res.status(404).json({ status: 404, message: "No data found" });
            throw new Error("No data found");
        } else if (fileData.length > 1) {
            res.status(500).json({ status: 500, message: "Multiple data found" });
            throw new Error("Multiple data found");
        }

        if (await comparePassword(data.password, fileData[0].password)) {
            fileData[0].latestSession = new Date();

            res.cookie("userId", fileData[0].userId, {
                maxAge: 1000 * 60 * 60 * 24 * 3.5, // 3.5 days
                httpOnly: false,
            });

            res.status(200).json({ status: 200, message: "Logged in" });
        } else {
            res.status(401).json({ status: 401, message: "Incorrect password" });
        }
    } catch (error: unknown) {
        console.error("Error:", error);
    }
});

app.get("/login", checkSession, (req, res) => {
    res.redirect(`http://${APP_HOSTNAME}:${CLIENT_PORT}`);
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
        const fileData = JSON.parse(await getItemsFromDatabase("users", { userId: req.cookies["userId"] }));

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
        const data = req.cookies["userId"];
        const dataValues = req.body.eventValues;

        console.log(dataValues);

        if (!data) {
            throw new Error("No data found");
        }

        const fileData: EventsData[] = JSON.parse(await getItemsFromDatabase("events", { userId: data }));

        if (!fileData || fileData.length === 0) {
            const newEvent = {
                userId: data,
                events: [dataValues],
            };

            await writeToDatabase("events", newEvent);
        } else {
            fileData[0].events.push(dataValues);

            delete fileData[0]._id;

            const modify = await modifyInDatabase({ userId: data }, fileData[0], "events");

            if (!modify) {
                throw new Error("Error modifying data");
            }
        }

        res.status(200).json({ status: 200, message: "Events saved" });
    } catch (error: unknown) {
        console.error("Error:", error);
    }
});

app.post("/post/password", async (req, res) => {
    try {
        const data = req.body;
        const cookie = req.cookies["userId"];

        if (!data) {
            throw new Error("No data found");
        }

        const fileData = JSON.parse(await getItemsFromDatabase("users", { userId: cookie }));

        if (await comparePassword(data.password, fileData[0].password)) {
            res.status(200).json({ status: 200, message: "Password is the same" });
            return;
        }

        if (!fileData || fileData.length === 0) {
            res.status(404).json({ status: 404, message: "No data found" });
            throw new Error("No data found");
        } else if (fileData.length > 1) {
            res.status(500).json({ status: 500, message: "Multiple data found" });
            throw new Error("Multiple data found");
        }

        fileData[0].password = encrypts.permanentEncryptPassword(data.password);

        delete fileData[0]._id;

        const modify = await modifyInDatabase({ userId: cookie }, fileData[0], "users");

        if (!modify) {
            res.status(500).json({ status: 500, message: "Error modifying data" });
            throw new Error("Error modifying data");
        }

        res.status(200).json({ status: 200, message: "Password saved" });
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
        const data: string = req.cookies["userId"];

        if (!data) {
            res.status(400).json({ status: 400, message: "No data found" });
            return;
        }

        const fileData = JSON.parse(await getItemsFromDatabase("events", { userId: data }));

        if (!fileData) {
            res.status(200).json({ status: 200, message: "No events found" });
        } else {
            delete fileData[0]._id;
            delete fileData[0].userId;
            res.status(200).json(fileData[0]);
        }
    } catch (error: unknown) {
        console.error("Error:", error);
    }
});

app.post("/credentials/logout", async (req, res) => {
    try {
        const data = req.cookies["userId"];

        if (!data) {
            return res.status(400).json({ status: 400, message: "No data found" });
        }

        await getItemsFromDatabase("users", { userId: data });

        res.clearCookie("userId");

        req.session.destroy((err) => {
            if (err) {
                console.error("Session destruction error:", err);
                return res.status(500).json({ status: 500, message: "Error during logout" });
            }
            res.clearCookie("connect.sid");
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
