const express = require('express');
const passport = require('passport');
const Strategy = require('passport-twitter').Strategy;
const session = require('express-session');

const thirdPartyService = require('../services/thirdPartyService');
const sessionAuthenticator = require('../middlewares/sessionAuthenticator');
const values = require('./../utils/values');
const helpers = require('./../utils/helpers');
const paramValidator = require('../middlewares/paramValidator');


const thirdPartyRouter = express.Router();

// config passport
passport.use(new Strategy({
	consumerKey: 'XGTk0YSaygfLaqCw2wK753Cur',
	consumerSecret: '2hIqdSGQ8j6UJT8qa4VkrRIvXbwYMQh6isUiR4ZlpJkJ3lEIMe',
	callbackURL: "https://hw7-back-end.herokuapp.com/auth/twitter/cb"
}, (token, tokenSecret, profile, cb) => cb(null, profile)));

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

thirdPartyRouter.use(session({
	secret: 'Hao Cui',
	resave: true,
	saveUninitialized: true
}));

thirdPartyRouter.use(passport.initialize());
thirdPartyRouter.use(passport.session());


thirdPartyRouter.get('/auth/twitter', passport.authenticate('twitter'));

thirdPartyRouter.get('/auth/twitter/fail', (req, res, next) => res.send(helpers.generateFailureRedirectHTML()));

thirdPartyRouter.get('/auth/twitter/cb',
	passport.authenticate('twitter', { failureRedirect: '/auth/twitter/fail' }),
	sessionAuthenticator.tryToReceive,
	(req, res, next) => {
		// if already logged-in, link account; else go to next
		if (!req.loggedInUser) return next();

		thirdPartyService.link({
			username: req.loggedInUser.username,
			thirdPartyUsername: req.user.username
		}, "twitter")
			.then(() => res.send(helpers.generateSuccessRedirectHTML("profile")))
			.catch(err => next(err));
	},
	(req, res, next) => {
		// try to login; if fails, go to register
		thirdPartyService.logIn({ thirdPartyUsername: req.user.username }, "twitter")
			.then(results => {
				if (results.result === "success") {
					res.cookie(values.cookieKey, results.sid, { maxAge: 3600*1000, httpOnly: true });

					res.send(helpers.generateSuccessRedirectHTML("main", results.username));
				} else {
					next();
				}
			})
			.catch(err => next(err));
	},
	(req, res, next) => {
		// register and then login (set session)
		thirdPartyService.register({ thirdPartyUsername: req.user.username }, "twitter")
			.then(results => {
				res.cookie(values.cookieKey, results.sid, { maxAge: 3600*1000, httpOnly: true });

				res.send(helpers.generateSuccessRedirectHTML("main", results.username));
			})
			.catch(err => next(err));
	}
);

thirdPartyRouter.put('/auth/twitter/link',
	sessionAuthenticator.receive,
	paramValidator.generateThirdPartyAccountValidator(),
	paramValidator.generateBodyValidator({
		username: /^.+$/,
		password: /^.+$/
	}),
	(req, res, next) => {
		let params = { thirdPartyAccountUsername: req.user.username };
		Object.keys(req.body).forEach(key => params[key] = req.body[key]);

		thirdPartyService.linkLocal(params, "twitter")
			.then(results => {
				res.cookie(values.cookieKey, results.sid, { maxAge: 3600*1000, httpOnly: true });

				res.json({ result: "success", username: results.username });
			})
			.catch(err => next(err));
	}
);

thirdPartyRouter.delete('/auth/twitter/unlink',
	sessionAuthenticator.receive,
	(req, res, next) => {
		thirdPartyService.unlink({ username: req.user.username }, "twitter")
			.then(results => res.json({ result: "success", username: req.user.username }))
			.catch(err => next(err));
	}
);


module.exports = thirdPartyRouter;
