const ObjectId= require('mongoose').Types.ObjectId;

const helpers = require('../utils/helpers');


const paramValidator = {
	generateParamsIdValidator: (key) => {
		return (req, res, next) => {
			if (req.params && req.params[key]) {
				const value = req.params[key];
				if (value.indexOf(',') != -1) {
					const ids = value.trim().replace(' ', '').split(',');
					for (let i = 0; i < ids; i++) {
						if (!ObjectId.isValid(ids[i])) return next(helpers.generateError(400, 'Invalid id.'));
					}
				} else if (!ObjectId.isValid(value)) {
					return next(helpers.generateError(400, 'Invalid id.'));
				}
			}

			next();
		};
	},

	generateBodyValidator: (pairs) => {
		return (req, res, next) => {
			if (!req.body) return next(helpers.generateError(400, 'Please provide enough params.'));

			let msg = '';
			Object.keys(pairs).forEach(key => {
				if (!req.body[key] || !req.body[key].match(pairs[key])) msg += 'Please provide valid ' + key + '. ';
			});

			if (msg) next(helpers.generateError(400, msg));
			else next();
		};
	},

	generateFileValidator: () =>
		(req, res, next) => req.file ? next() : next(helpers.generateError(400, 'Please provide file.')),

	generateDobValidator: (age) => {
		return (req, res, next) => {
			if (!req.body.dob) return next(helpers.generateError(400, 'Please provide enough params.'));

			let birthDate = req.body.dob;

			let user = new Date(birthDate);
			if (user.toDateString() == "Invalid Date")
				return next(helpers.generateError(400, 'Please provide valid birth date.'));

			let now = new Date();
			let yearDiff = now.getFullYear() - user.getUTCFullYear();
			if (yearDiff > age
				|| (yearDiff == age && (now.getMonth() > user.getUTCMonth()
				|| (user.getUTCMonth() == now.getMonth() && now.getDate() > user.getUTCDate())))) {
				next();
			} else {
				next(helpers.generateError(400, 'Your age does not fulfill the requirement.'));
			}
		};
	},

	generateThirdPartyAccountValidator: () =>
		(req, res, next) =>
			req.user.username.indexOf("@") !== -1 ?
				next() : next(helpers.generateError(400, 'Not a third-party account.')),
};

module.exports = paramValidator;
