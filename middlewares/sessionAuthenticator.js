const md5 = require('md5');

const values = require('./../utils/values');
const helpers = require('../utils/helpers');


let sessionUserMap = {};

const sessionAuthenticator = {
	set: (user) => {
		const key = md5(values.token + new Date().getTime() + user.username);
		sessionUserMap[key] = user;

		return key;
	},

	receive: (req, res, next) => {
		const key = req.cookies[values.cookieKey];
		if (key) {
			const user = sessionUserMap[key];

			// save to req
			if (user) {
				req.user = user;

				next();
			} else {
				next(helpers.generateError(401, 'Unauthorized.'));
			}
		} else {
			next(helpers.generateError(401, 'Unauthorized.'));
		}
	},

	tryToReceive: (req, res, next) => {
		const key = req.cookies[values.cookieKey];
		if (key) {
			const user = sessionUserMap[key];

			// save to req
			if (user) {
				req.loggedInUser = user;

				return next();
			}
		}

		next();
	},

	remove: (req, res, next) => {
		const key = req.cookies[values.cookieKey];
		if (key) {
			const user = sessionUserMap[key];

			// delete from map
			if (user) {
				delete sessionUserMap[key];

				next();
			} else {
				next(helpers.generateError(401, 'Unauthorized.'));
			}
		} else {
			next(helpers.generateError(401, 'Unauthorized.'));
		}
	},
};


module.exports = sessionAuthenticator;
