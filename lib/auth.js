'use strict';
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GITHUB_CLIENT_ID = '5cd8619e301af17b466b';
const GITHUB_CLIENT_SECRET = '32b11d9a50333940545fb523485973418f3d7cee';

function githubAuth() {
  handleSession();

  passport.use(new GitHubStrategy({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:8000/auth/github/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => {
        return done(null, profile);
      });
    }
  ));
}

// TODO facebook
// function facebookAuth() {
//   handleSession();
// }

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
}