const express = require('express');
const multer = require('multer');

const articleService = require('../services/articleService');
const paramValidator = require('../middlewares/paramValidator');


const articleRouter = express.Router();

articleRouter.post('/article/my',
	multer().single('file'),
	paramValidator.generateBodyValidator({ text: /^.+$/ }),
	(req, res, next) => {
		let params = {
			username: req.user.username,
			userId: req.user.id,
			text: req.body.text
		};
		if (req.file) params.imageStream = req.file;

		articleService.post(params, false)
			.then((results) => res.json({ article: results }))
			.catch(err => next(err));
	}
);

articleRouter.put('/articles/my/:id',
	paramValidator.generateParamsIdValidator('id'),
	paramValidator.generateBodyValidator({ text: /^.+$/ }),
	(req, res, next) => {
		let params = {
			username: req.user.username,
			userId: req.user.id,
			articleId: req.params.id
		};
		Object.keys(req.body).forEach(key => params[key] = req.body[key]);

		articleService.modify(params, false)
			.then((results) => res.json({ article: results }))
			.catch(err => next(err));
	}
);

articleRouter.post('/article',
	multer().single('file'),
	paramValidator.generateBodyValidator({ text: /^.+$/ }),
	(req, res, next) => {
		let params = {
			username: req.user.username,
			userId: req.user.id,
			text: req.body.text
		};
		if (req.file) params.imageStream = req.file;

		articleService.post(params, true)
			.then((results) => res.json({ articles: results }))
			.catch(err => next(err));
	}
);

articleRouter.put('/articles/:id',
	paramValidator.generateParamsIdValidator('id'),
	paramValidator.generateBodyValidator({ text: /^.+$/ }),
	(req, res, next) => {
		let params = {
			username: req.user.username,
			userId: req.user.id,
			articleId: req.params.id
		};
		Object.keys(req.body).forEach(key => params[key] = req.body[key]);

		articleService.modify(params, true)
			.then((results) => res.json({ articles: results }))
			.catch(err => next(err));
	}
);

articleRouter.get('/articles/:id*?',
	paramValidator.generateParamsIdValidator('id'),
	(req, res, next) => {
		let params = { userId: req.user.id };
		if (req.params && req.params.id) params.id = req.params.id;

		articleService.retrieve(params)
			.then((results) => res.json({ articles: results }))
			.catch(err => next(err));
	}
);


module.exports = articleRouter;
