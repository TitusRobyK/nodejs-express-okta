const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-openidconnect');
const express = require("express");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const app = express();
const PORT = process.env.PORT || 3000;

//cors options
const corsOption = {
  origin: process.env.CLIENT_ORIGIN,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};

app.use(cors(corsOption));

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use('oidc', new Strategy({
  issuer: process.env.OKTA_ISSUER,
  authorizationURL: process.env.OKTA_AUTHORIZATION_URL,
  tokenURL: process.env.OKTA_TOKEN_URL,
  userInfoURL:process.env.OKTA_USERINFO_URL,
  clientID: process.env.OKTA_CLIENT_ID,
  clientSecret:process.env.OKTA_CLIENT_SECRET,
  callbackURL: process.env.OKTA_CALLBACK_URL,
  scope: 'openid profile'
}, (issuer, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, next) => {
  next(null, user);
});

passport.deserializeUser((obj, next) => {
  next(null, obj);
});

app.get("/login-success", (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: "User has been Successfully Authenticated",
      user: req.user,
      cookies: req.cookies,
    });
  } else {
    req.logout();
    req.session.destroy();
    res.json({
      success: false,
      message: "404 Unauthorized"
    });
  }
});


app.use("/login", passport.authenticate('oidc'));

app.use('/authorization-code/callback',
  passport.authenticate('oidc', { failureRedirect: '/error' }),
  (req, res) => {
    console.log(req.user);
    const jwt = generateJWT(req.user);
    res.cookie(process.env.EXPRESS_JWT_TOKEN_NAME, jwt, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true
    });
    //Page within AEM preferably profile or auth page within AEM 
    res.redirect(process.env.CLIENT_REDIRECT_URL);
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect(process.env.CLIENT_REDIRECT_URL);
});


function generateJWT(userinfo) {
  return jwt.sign(userinfo,process.env.EXPRESS_JWT_SECRET, {
    expiresIn: '1h'
  });
}


app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
