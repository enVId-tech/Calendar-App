import express, { Express } from "express";
import { APP_HOSTNAME, SERVER_PORT, CLIENT_ID } from "./modules/env";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import connectMongoDBSession from "connect-mongodb-session";
import cors from 'cors';
import dotenv from "dotenv";
import "./setupProxy";
import { generateRandomNumber, permanentEncryptPassword } from "./modules/encryption";

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
const SECRET: string = permanentEncryptPassword(generateRandomNumber(256, "alphanumeric").toString());

app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoDBStore({
    uri: process.env.MONGODB_URI!,
    databaseName: process.env.CLIENT_DB,
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 31, // 1 month
    autoRemove: 'interval',
    autoRemoveInterval: 10 * 1000 // interval between expired sessions check in milliseconds
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 3.5, // 3.5 days
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Requests for the Google OAuth2.0 login page
passport.serializeUser((user, done) => {
  done(null, user);
});

// Requests for the Google OAuth2.0 login page
passport.deserializeUser((user, done) => {
  return done(null, user);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});



app.listen(SERVER_PORT, () => {
  console.log(`Server is running at http://${APP_HOSTNAME}:${SERVER_PORT}`);
});