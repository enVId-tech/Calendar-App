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
import "./setupProxy";
import {
  generateRandomNumber,
  permanentEncryptPassword,
} from "./modules/encryption";
import { getItemsFromDatabase, writeToDatabase } from "./modules/mongoDB";

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
      collection: "users",
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

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google'), async (req, res) => {
    try {

        const userProfile: any = req.user;

        console.log('User profile:\n', userProfile);

        if (!userProfile) {
            throw new Error('No user profile found');
        }

        const fileData = JSON.parse(await getItemsFromDatabase('users'));

        if (!fileData) {
            throw new Error('No data found');
        }

        const user = fileData.find((item) => item.email === userProfile.emails[0].value);

        res.cookie('user', userProfile.emails[0].value, { maxAge: 900000, httpOnly: true });
        res.cookie('name', userProfile.displayName, { maxAge: 900000, httpOnly: true });

        res.redirect('http://localhost:3000/');

        if (!user) {
            const newUser = {
                displayName: userProfile.displayName,
                firstName: userProfile.name.givenName,
                lastName: userProfile.name.familyName,
                email: userProfile.emails[0].value,
                profilePicture: userProfile.photos[0].value,
                hd: userProfile._json.hd,
                calendar: {},
                userId: await generateRandomNumber(64, 'alphanumeric'),
                session: req.sessionID,
            };

            await writeToDatabase('users', newUser);
        } else {
            req.session!.user = user;
            res.redirect('/');
        }
    } catch (error: unknown) {
        console.error('Error:', error);
    }
});

app.get('/auth/logout', (req, res) => {
    req.session!.destroy(() => {
        res.redirect('/');
    });
});

app.post('/calendar/user/data', async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            throw new Error('No data found');
        }

        await getItemsFromDatabase('calendar', true, { email: data.userId });

        res.status(200).json({ status: 200, message: 'Data saved' });
    } catch (error: unknown) {
        console.error('Error:', error);
    }
});

app.listen(SERVER_PORT, () => {
  console.log(`Server is running at http://${APP_HOSTNAME}:${SERVER_PORT}`);
});
