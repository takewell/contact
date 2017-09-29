const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');

// moduels 
const User = require('./models/user');
const Schedule = require('./models/schedule');
const Availability = require('./models/availability');
const Candidate = require('./models/candidate');
const Comment = require('./models/comment');

User.sync().then(() => {
  Schedule.belongsTo(User, { foreignKey: 'createdBy' });
  Schedule.sync();
  Comment.belongsTo(User, { foreignKey: 'userId' });
  Comment.sync();
  Availability.belongsTo(User, { foreignKey: 'userId' });
  Candidate.sync().then(() => {
    Availability.belongsTo(Candidate, { foreignKey: 'candidateId' });
    Availability.sync();
  });
});

// routes
const index = require('./routes/index');
const login = require('./routes/login');
const logout = require('./routes/logout');
const schedules = require('./routes/schedules');
const auth = require('./lib/auth');

const app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// express-session と passport でセッションを利用
app.use(session({ secret: '468f60563eec98a0', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// -> routes
app.use('/', index);
app.use('/login', login);
app.use('/logout', logout);
app.use('/schedules', schedules);

auth.githubAuth();
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  (req, res) => {});
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });

auth.facebookAuth();
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] }),
  (req, res) => {});

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;