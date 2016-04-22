var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var sha1 = require('sha1');

//Modelos
var User = require('../models/user');
var Contact = require('../models/contact');

//Rutas

// users routes
User.methods(['post']);
User.before('post', encode_user_pass);
function encode_user_pass(req, res, next) {
  if(req.body.password){
    var passEncoded = sha1(req.body.password);
    req.body.password = passEncoded;
  }
  next();
}
User.register(router, '/setup');

// route to authenticate a users
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
      if (user.password != sha1(req.body.password)) {
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

// basic route
router.get('/', function(req, res) { 
    res.render('index', {
      title: 'Contacts Application'  
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

// contacts routes
Contact.methods(['get', 'put', 'post', 'delete']);
Contact.before('post', set_and_prepare_contact_info);
function set_and_prepare_contact_info(req, res, next) {

  if(req.body.email){

    //find the contact
    Contact.findOne({
      email: req.body.email,
      userid: req.decoded._doc._id
    }, function(err, contact) {

      if (err) throw err;

      if (!contact) {
        req.body.userid = req.decoded._doc._id;
        next();    
      } else if (contact) {
        if(contact.userid == req.decoded._doc._id){
          return res.status(500).send({ 
              name: "MongoError", 
              message: 'exception: E11000 duplicate key error index: contactsdbmongo.contacts.$email_1 dup key: { : \"' + req.body.email + '\" }', 
              errmsg: 'exception: E11000 duplicate key error index: contactsdbmongo.contacts.$email_1 dup key: { : \"' + req.body.email + '\" }',
              code: 11000,
              ok: 0
          });   
        }else{
          req.body.userid = req.decoded._doc._id;
          next();        
        }             
      }

    });    

  }else{
    req.body.userid = req.decoded._doc._id;
    next();
  }  
}

Contact.before('put', validate_unique_contac);
function validate_unique_contac(req, res, next) {

  if(req.body.email){

    //find the contact to be updated
    Contact.findOne({
      _id: req.params.id,
      userid: req.decoded._doc._id
    }, function(err, contact) {

      if (err) throw err;

      if (!contact) {
        next();    
      } else if (contact) {
        if(contact.email == req.body.email){
          next();
        }else{
          //find contact with email
          Contact.findOne({
            email: req.body.email,
            userid: req.decoded._doc._id
          }, function(err, contactWithEmail) {

            if (err) throw err;

            if (!contactWithEmail) {
              next();    
            } else if (contactWithEmail) {              
                return res.status(500).send({ 
                  name: "MongoError", 
                  message: 'exception: E11000 duplicate key error index: contactsdbmongo.contacts.$email_1 dup key: { : \"' + req.body.email + '\" }', 
                  errmsg: 'exception: E11000 duplicate key error index: contactsdbmongo.contacts.$email_1 dup key: { : \"' + req.body.email + '\" }',
                  code: 11000,
                  ok: 0
                });                           
            }
          });
        }                      
      }
    }); 
  }else{
    next();
  }
  
}

Contact.register(router, '/contacts');

// returns control to the app
module.exports = router;
