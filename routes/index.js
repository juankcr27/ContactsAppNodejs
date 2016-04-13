var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

//Modelos
var User = require('../models/user');
var Contact = require('../models/contact');

//Rutas

// users routes
User.methods(['post','get', 'delete']);
User.register(router, '/setup');

// route to authenticate a user (POST http://localhost:3000/api/authenticate)
router.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    username: req.body.username
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('jwtTokenSecret'), {
          expiresIn: 3600 // expires in 1 hour
        });

        // return the information including token as JSON
        res.json({
          success: true,
          userid: user._id,
          token: token
        });
      }   

    }

  });
});

// route middleware to verify a token
router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('jwtTokenSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;   
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
});

// basic route
router.get('/', function(req, res) { 
    res.render('index', {
      title: 'Contacts Application'  
    });
});

// contacts routes
Contact.methods(['get', 'put', 'post', 'delete']);
Contact.before('post', set_user_reference);
function set_user_reference(req, res, next) {
  req.body.userid = req.decoded._doc._id;
  next();
}

Contact.register(router, '/contacts');

// returns control to the app
module.exports = router;
