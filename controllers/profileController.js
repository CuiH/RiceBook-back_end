const express = require('express');
const multer = require('multer');

const profileService = require('../services/profileService');
const paramValidator = require('../middlewares/paramValidator');
const helpers = require('../utils/helpers');


const profileRouter = express.Router();

profileRouter.put('/headline',
	paramValidator.generateBodyValidator({ headline: /^.+$/ }),
	(req, res, next) => {
		let params = { userId: req.user.id };
		Object.keys(req.body).forEach(key => params[key] = req.body[key]);

		profileService.updateHeadline(params)
			.then(() => res.json({
				username: req.user.username,
				headline: req.body.headline
			}))
			.catch(err => next(err));
	}
);

profileRouter.get('/headlines/:users?',
	paramValidator.generateParamsIdValidator('users'),
	(req, res, next) => {
		profileService.retrieveHeadlines({ userIds: req.params && req.params.users ? req.params.users : req.user.id })
			.then((results) => res.json({ headlines: results }))
			.catch(err => next(err));
	}
);

profileRouter.put('/email',
	paramValidator.generateBodyValidator({ email: /^\w+(\.\w+)*@\w+(\.\w+)+$/ }),
	(req, res, next) => {
		let params = { userId: req.user.id };
		Object.keys(req.body).forEach(key => params[key] = req.body[key]);

		profileService.updateEmail(params)
			.then((results) => res.json({
				username: req.user.username,
				email: req.body.email
			}))
			.catch(err => next(err));
	}
);

profileRouter.get('/email/:user?',
	paramValidator.generateParamsIdValidator('user'),
	(req, res, next) => {
		profileService.retrieveEmail({ userId: req.params && req.params.user ? req.params.user : req.user.id })
			.then((results) => res.json(results))
			.catch(err => next(err));
	}
);

profileRouter.put('/zipcode',
	paramValidator.generateBodyValidator({ zipcode: /^\d{5}$/ }),
	(req, res, next) => {
		let params = { userId: req.user.id };
		Object.keys(req.body).forEach(key => params[key] = req.body[key]);

		profileService.updateZipcode(params)
			.then((results) => res.json({
				username: req.user.username,
				zipcode: req.body.zipcode
			}))
			.catch(err => next(err));
	}
);

profileRouter.get('/zipcode/:user?',
	paramValidator.generateParamsIdValidator('user'),
	(req, res, next) => {
		profileService.retrieveZipcode({ userId: req.params && req.params.user ? req.params.user : req.user.id })
			.then((results) => res.json(results))
			.catch(err => next(err));
	}
);

profileRouter.put('/phone',
	paramValidator.generateBodyValidator({ phone: /^\d{3}-\d{3}-\d{4}$/ }),
	(req, res, next) => {
		let params = { userId: req.user.id };
		Object.keys(req.body).forEach(key => params[key] = req.body[key]);

		profileService.updatePhone(params)
			.then((results) => res.json({
				username: req.user.username,
				phone: req.body.phone
			}))
			.catch(err => next(err));
	}
);

profileRouter.get('/phone/:user?',
	paramValidator.generateParamsIdValidator('user'),
	(req, res, next) => {
		profileService.retrievePhone({ userId: req.params && req.params.user ? req.params.user : req.user.id })
			.then((results) => res.json(results))
			.catch(err => next(err));
	}
);

profileRouter.put('/avatar',
	multer().single('file'),
	paramValidator.generateFileValidator(),
	(req, res, next) => {
		let params = {
			userId: req.user.id,
			avatarStream: req.file,
		};

		profileService.updateAvatar(params)
			.then(avatar => res.json({
				username: req.user.username,
				avatar: avatar
			}))
			.catch(err => next(err));
	}
);

profileRouter.get('/avatars/:users?',
	paramValidator.generateParamsIdValidator('users'),
	(req, res, next) => {
		profileService.retrieveAvatar({ userIds: req.params && req.params.users ? req.params.users : req.user.id })
			.then((results) => res.json({ avatars: results }))
			.catch(err => next(err));
	}
);

profileRouter.put('/password',
	(req, res, next) =>
		next(helpers.generateError(400, 'Password cannot be updated.'))
);

profileRouter.get('/dob/:user?',
	paramValidator.generateParamsIdValidator('user'),
	(req, res, next) => {
		profileService.retrieveDob({ userId: req.params && req.params.user ? req.params.user : req.user.id })
			.then((results) => res.json(results))
			.catch(err => next(err));
	}
);

profileRouter.get('/brief/:user?',
	paramValidator.generateParamsIdValidator('user'),
	(req, res, next) => {
		profileService.retrieveBrief({ userId: req.params && req.params.user ? req.params.user : req.user.id })
			.then((results) => res.json(results))
			.catch(err => next(err));
	}
);

profileRouter.get('/detail/:user?',
	paramValidator.generateParamsIdValidator('user'),
	(req, res, next) => {
		profileService.retrieveDetail({ userId: req.params && req.params.user ? req.params.user : req.user.id })
			.then((results) => res.json(results))
			.catch(err => next(err));
	}
);


module.exports = profileRouter;
