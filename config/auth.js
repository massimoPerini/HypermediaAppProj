/**
This configuration files includes the basic PassportJS strategy to
implement login and signup functionalities for the website.

The middlewares written here simply connect the DB user structure to the
passport library.

Passport is also used to automatically handle sessions (not persistently)
 * @module auth
 */

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var sha1 = require('sha1');
var models = require('../models');

// This 2 functions are used by passport to serialize and deserialize user objects by passport (required)
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

/**
 * This middleware provides the Local-Login strategy from PassportJS.
 * It simply loads the intended user from the DB and check the hashed password
 * @module local-login
 * @function
 * @param {Object} username - Intended user's username
 * @param {Object} password - Provided password
 * @param {Function} done - Express done middleware function
 * @return {undefined}
 */
passport.use('local-login', new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    models.users.find({where:{'username': username}}).then(function(user){
    	if(!user){
    		return done(null, false);
    	}
    	if(user.password != sha1(password)){
    		return done(null,false);
    	}
    	return done(null, user);
    });
  });
}));

/**
 * This middleware provides the Local-Signup strategy from PassportJS.
 * It accepts a new user and insert it into the DB. In the case that
 * the username already exists, the middleware raises an error.
 * @module local-signup
 * @function
 * @param {Object} username - Chosen username
 * @param {Object} password - Provided password
 * @param {Object} mail - Provided email
 * @param {Object} name - Provided name
 * @param {Object} cf - Provided SSN (Codice Fiscale)
 * @param {Function} done - Express done middleware function
 * @return {undefined}
 */
passport.use('local-signup', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, username, password, done){
  return models.users.create({
    username: username,
    password: password,
    mail: req.body.mail,
    name: req.body.name,
    surname: req.body.surname,
    cf: req.body.cf
  }).then(function(user){
    done(null, user);
  }).catch(function(error){
    done(error);
  });
}));

module.exports = passport;
