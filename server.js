const session = require("express-session");
const passport = require("passport");
const { Strategy } = require("passport-openidconnect");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const app = express();
const OktaJwtVerifier = require('@okta/jwt-verifier');
const PORT = process.env.PORT || 3000;

//cors options
const corsOption = {
  origin: process.env.CLIENT_ORIGIN,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"],
};

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: process.env.OKTA_ISSUER,
  clientID: process.env.OKTA_CLIENT_ID
});

app.use(cors(corsOption));

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  "oidc",
  new Strategy(
    {
      issuer: process.env.OKTA_ISSUER,
      authorizationURL: process.env.OKTA_AUTHORIZATION_URL,
      tokenURL: process.env.OKTA_TOKEN_URL,
      userInfoURL: process.env.OKTA_USERINFO_URL,
      clientID: process.env.OKTA_CLIENT_ID,
      clientSecret: process.env.OKTA_CLIENT_SECRET,
      callbackURL: process.env.OKTA_CALLBACK_URL,
      scope: "openid profile",
    },
    (issuer, profile, idToken, accessToken, done) => {
      var userData = {};
      userData.profile = profile;
      userData.idToken = idToken;
      userData.accessToken = accessToken;
      console.log(JSON.stringify(userData));
      return done(null, userData);
    }
  )
);

passport.serializeUser((user, next) => {
  next(null, user);
});

passport.deserializeUser((obj, next) => {
  next(null, obj);
});

app.get("/login-verify", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);

    if (!match) {
      res.status(401);
      return next('Unauthorized');
    }

    const token = match[1];
    //TODO : This method needs to wrapper in a function & can be used to access protected API Call's
    const jwt = await oktaJwtVerifier.verifyAccessToken(token, "0oa8729t707wq4rqE5d7");
    console.log(JSON.stringify(jwt, null));
    console.log('token validation successful');
    res.json({
      success: true,
      message: "User has been Successfully Authenticated",
      userId: jwt.claims.sub
    });
  } catch (error) {
    console.warn('token failed validation');
    res.status(401).send("Unauthorized");
  }
});

app.use("/login", passport.authenticate("oidc"));

app.use(
  "/authorization-code/callback",
  passport.authenticate("oidc", { failureRedirect: "/error" }),
  (req, res) => {
    console.log(req.user);
    //Page within AEM preferably profile or auth page within AEM
    res.redirect(process.env.CLIENT_REDIRECT_URL + "?okta-token=" + req.user.accessToken);
  }
);

app.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);

    if (!match) {
      res.status(401);
      return next('Unauthorized');
    }

    const accessToken = match[1];
    const jwt = await oktaJwtVerifier.verifyAccessToken(accessToken, "0oa8729t707wq4rqE5d7");
    console.log(JSON.stringify(jwt, null));
    console.log('token validation successful');
    let oktaLogoutUrl = process.env.OKTA_LOGOUT_URL + "?id_token_hint=" + accessToken
    console.log(oktaLogoutUrl);
    req.logout();
    req.session.destroy();
    // User has to be forced to redirect to oktaLogoutUri to kill the session , Else we have to use direct core API's /api/v1/sessions/* utilizing a long lived access token.
    res.json({
      success: true,
      message: "User has been Successfully Logged Out ",
      logOutUri: oktaLogoutUrl
    });
    //res.redirect(oktaLogoutUrl);
  } catch (error) {
    console.warn('token failed validation');
    console.error(error);
    res.status(401).json({
      success: true,
      message: "Token is inavalid or Token has expired.",
    });
  }
});

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);