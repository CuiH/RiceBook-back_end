const express = require('express');

const authService = require('../services/authService');
const values = require('../utils/values');
const sessionAuthenticator = require('../middlewares/sessionAuthenticator');
const paramValidator = require('../middlewares/paramValidator');


const authRouter = express.Router();

authRouter.post('/register',
	paramValidator.generateBodyValidator({
		username: /^[a-zA-Z]+[a-zA-Z0-9]*$/,
		email: /^\w+(\.\w+)*@\w+(\.\w+)+$/,
		phone: /^\d{3}-\d{3}-\d{4}$/,
		zipcode: /^\d{5}$/,
		password: /^.+$/
	}),
	paramValidator.generateDobValidator(18),
	(req, res, next) => {
		authService.register(req.body)
			.then((results) => res.json({ result: 'success', username: results.username }))
			.catch(err => next(err));
	}
);

authRouter.post('/login',
	paramValidator.generateBodyValidator({
		username: /^.+$/,
		password: /^.+$/
	}),
	(req, res, next) => {
		authService.logIn(req.body)
			.then((results) => {
				// set cookie
				res.cookie(values.cookieKey, results.sid, { maxAge: 3600*1000, httpOnly: true });

				res.json({
					result: 'success',
					username: results.username
				});
			})
			.catch(err => next(err));
	}
);

authRouter.put('/logout',
	sessionAuthenticator.remove,
	(req, res, next) => {
		// clear cookie
		res.cookie(values.cookieKey, "", { maxAge: 0, httpOnly: true });

		res.json({ result: 'success' });
	});


module.exports = authRouter;
