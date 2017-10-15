'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '5cd8619e301af17b466b';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '32b11d9a50333940545fb523485973418f3d7cee';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '1584743904911001';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '6235ed2647af47d79b5c16880a70b5ad';
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || 'LnlxhSHLTWGVzsUH9NkknMCRe';
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || 'U0mIIxR8ItYckAaqpAjpo8OTG4lKkfJXzlGHTTTkV2FIkaeE7a';
const User = require('../models/user');


githubAuth();
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }),
  (req, res) => {});

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    var loginFrom = req.cookies.loginFrom;
        // オープンリダイレクタ脆弱性対策
        if (loginFrom &&
         loginFrom.indexOf('http://') < 0 &&
         loginFrom.indexOf('https://') < 0) {
          res.clearCookie('loginFrom');
          res.redirect(loginFrom);
        } else {
          res.redirect('/');
        }
  });

facebookAuth();
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] }),
  (req, res) => {});

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    var loginFrom = req.cookies.loginFrom;
    // オープンリダイレクタ脆弱性対策
    if (loginFrom &&
     loginFrom.indexOf('http://') < 0 &&
     loginFrom.indexOf('https://') < 0) {
      res.clearCookie('loginFrom');
      res.redirect(loginFrom);
    } else {
      res.redirect('/');
    }
  });

twitterAuth();
router.get('/twitter',
  passport.authenticate('twitter'),
  (req, res) => {});

router.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => {
    var loginFrom = req.cookies.loginFrom;
    // オープンリダイレクタ脆弱性対策
    if (loginFrom &&
     loginFrom.indexOf('http://') < 0 &&
     loginFrom.indexOf('https://') < 0) {
      res.clearCookie('loginFrom');
      res.redirect(loginFrom);
    } else {
      res.redirect('/');
    }
  });

function githubAuth() {
  handleSession();
  passport.use(new GitHubStrategy({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: process.env.HEROKU_URL ? process.env.HEROKU_URL + 'auth/github/callback' : 'http://localhost:8000/auth/github/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => {
        User.upsert({
          userId: profile.id,
          username: profile.username
        }).then(() => {
          done(null, profile);
        });
      });
    }
  ));
}

function facebookAuth() {
  handleSession();
  passport.use(new FacebookStrategy({
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: process.env.HEROKU_URL ? process.env.HEROKU_URL + 'auth/facebook/callback' : 'http://localhost:8000/auth/facebook/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => {
        User.upsert({
          userId: profile.id,
          username: profile.displayName
        }).then(() => {
          done(null, profile);
        });
      });
    }
  ));
}

function twitterAuth() {
  handleSession();
  passport.use(new TwitterStrategy({
      consumerKey: TWITTER_API_KEY,
      consumerSecret: TWITTER_API_SECRET,
      callbackURL: process.env.HEROKU_URL ? process.env.HEROKU_URL + 'auth/twitter/callback' : 'http://localhost:8000/auth/twitter/callback',
      includeEmail: true
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => {
        User.upsert({
          userId: profile.id,
          username: profile.username
        }).then(() => {
          done(null, profile);
        });
      });
    }
  ));
}

function handleSession() {
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
}

module.exports = router;