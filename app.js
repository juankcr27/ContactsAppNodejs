var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var cacheTime = 3600; // expires in 1 hour

var routes = require('./routes/index');

app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//MongoDB
mongoose.connect('mongodb://admin:123456abC@ds059155.mlab.com:59155/contactsdbmongo');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: cacheTime }));

app.use('/api/v1', routes);

app.set('jwtTokenSecret', 'ApplicationUTNProjectWebServicesAppMobiles');

module.exports = app;
