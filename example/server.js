/**
 * A quick copy/pasted example that demonstrates how to use this with passport
 * 
 * Authenticate at / which will redirect you to anilist
 * If you succesfully logged in, you'll be redirected to /user 
 * and provided a info dump on the user you logged in with.
 * Access /logout and try to reaccess /user, which you'd be unable to do.
 * 
 * Remember to fill in the clientID/clientSecret
 */

const express = require('express')
const session = require('express-session')
const passport = require('passport')
const Strategy = require('../lib').Strategy
const app = express();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new Strategy({
    clientID: '',
    clientSecret: '',
    callbackURL: 'http://localhost:5000/callback'
}, (_accessToken, _refreshToken, profile, done) => {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', passport.authenticate('anilist'), function(req, res) {});

app.get('/callback', passport.authenticate('anilist', { failureRedirect: '/', successRedirect: '/user' }));

app.get('/user', (req, res, next) => req.isAuthenticated() ? next() : res.send('Not logged in'), function(req, res) {
    res.json(req.user);
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.listen(5000, () => {
    console.log('Listening at http://localhost:5000/')
});