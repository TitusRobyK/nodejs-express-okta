const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-openidconnect');
const express = require("express");
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;

//cors options
const corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
  };
  
  app.use(cors(corsOption));
  
  // Body parser
  app.use(express.urlencoded({ extended: false }))
  app.use(express.json())


app.use(session({
    secret: 'CanYouLookTheOtherWay',
    resave: false,
    saveUninitialized: true
}));


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use('oidc', new Strategy({
    issuer: 'https://dev-84113371.okta.com/oauth2/default',
    authorizationURL: 'https://dev-84113371.okta.com/oauth2/default/v1/authorize',
    tokenURL: 'https://dev-84113371.okta.com/oauth2/default/v1/token',
    userInfoURL: 'https://dev-84113371.okta.com/oauth2/default/v1/userinfo',
    clientID: '0oa8729t707wq4rqE5d7',
    clientSecret: 'J_j0Qbk96ioi3pctk8TVauFs-1XM-XvRekhSZD-9',
    callbackURL: 'http://localhost:3000/authorization-code/callback',
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
      //Page within AEM preferably profile or login page within AEM 
      res.redirect('/login-success');
    }
  );
  
  app.post('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
  });


app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);