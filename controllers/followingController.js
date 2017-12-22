const express = require('express');

const followingService = require('../services/followingService');
const paramValidator = require('../middlewares/paramValidator');


const followingRouter = express.Router();

followingRouter.get('/following/my',
	(req, res, next) => {
		followingService.retrieveMy({ userId: req.user.id })
			.then((results) => res.json({
				username: req.user.username,
				following: results
			}))
			.catch(err => next(err));
	}
);

followingRouter.put('/following/my/:user',
	(req, res, next) => {
		followingService.followByUsername({
			userId: req.user.id,
			followingUsername: req.params.user
		})
			.then((results) => res.json({
				username: req.user.username,
				newFollowing: results
			}))
			.catch(err => next(err));
	}
);

followingRouter.get('/following/:user?',
	paramValidator.generateParamsIdValidator('user'),
	(req, res, next) => {
		followingService.retrieve({ userId: req.params && req.params.user ? req.params.user : req.user.id })
			.then((results) => res.json(results))
			.catch(err => next(err));
	}
);

followingRouter.put('/following/:user',
	paramValidator.generateParamsIdValidator('user'),
	(req, res, next) => {
		followingService.followById({
			userId: req.user.id,
			followingId: req.params.user
		})
			.then((results) => res.json({
				username: req.user.username,
				following: results
			}))
			.catch(err => next(err));
	}
);

followingRouter.delete('/following/:user',
	paramValidator.generateParamsIdValidator('user'),
	(req, res, next) => {
		followingService.remove({
			userId: req.user.id,
			followingId: req.params.user
		})
			.then((results) => res.json({
				username: req.user.username,
				following: results
			}))
			.catch(err => next(err));
	}
);


module.exports = followingRouter;
