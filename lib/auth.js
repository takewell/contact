'use strict';
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GITHUB_CLIENT_ID = '5cd8619e301af17b466b';
const GITHUB_CLIENT_SECRET = '32b11d9a50333940545fb523485973418f3d7cee';
const FACEBOOK_APP_ID = '1584743904911001'
const FACEBOOK_APP_SECRET = '6235ed2647af47d79b5c16880a70b5ad';
const User = require('../models/user');


function githubAuth() {
  handleSession();
  passport.use(new GitHubStrategy({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:8000/auth/github/callback'
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
      callbackURL: "http://localhost:8000/auth/facebook/callback"
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

// TODO twitter
// function twitterAuth() {
//   handleSession();
// }

function handleSession() {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
}

// routing もこのファイルに書き出したかったが module.exports が複数のオブジェクトを返す想定ではないみたい…またリファクタリングに挑戦したい。
module.exports = {
  githubAuth: githubAuth,
  facebookAuth: facebookAuth
}