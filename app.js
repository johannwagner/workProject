const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
//const hbs = require('handlebars');
const exphbs = require('express-handlebars');
const router = require('./router');
app = express();

let hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    views:  path.join(__dirname, 'views'),
    defaultLayout: 'layout',

});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'verybasicsecret',
    resave: true,
    saveUninitialized: true,

    cookie: {path:'/', secure: false, httpOnly: false, maxAge: 100000000}
}));

app.use('/js', express.static('views/js'));
app.use(router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error.hbs');
});

app.listen(4200);

module.exports = app;
