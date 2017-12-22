const mongoose = require('mongoose');
require('../utils/db');


const commentSchema = new mongoose.Schema({
	author:     String,
	authorId:   String,
	text:       String,
	createTime: Date,
});

const articleSchema = new mongoose.Schema({
	author:     String,
	authorId:  String,
	text:       String,
	createTime: Date,
	image:      { type: String, default: "" },
	comments:   { type: [ commentSchema ], default: [] }
});

const Article = mongoose.model('Article', articleSchema);

const articleModel = {
	/* params = {author, authorId, text, *image} */
	create: (params) => {
		let newArticle = new Article(params);
		newArticle.createTime = new Date();

		return articleModel.saveOne(newArticle)
			.then(() => newArticle);
	},

	/* params = {_id} */
	findOneById: (params) =>
		new Promise((resolve, reject) => {
			Article.findById(params._id, (err, article) => err ? reject(err) : resolve(article));
		}),

	/* params = {authorId} */
	findAllByAuthorId: (params) =>
		new Promise((resolve, reject) => {
			Article.find(params, (err, articles) => err ? reject(err) : resolve(articles))
				.limit(10).sort({ createTime: -1 });
		}),

	/* params = {author, newAuthor, newAuthorId} */
	updateAllByAuthor: (params) =>
		new Promise((resolve, reject) => {
			Article.update({ author: params.author }, { author: params.newAuthor, authorId: params.newAuthorId },
				err => err ? reject(err) : resolve());
		}),

	saveOne: (article) =>
		new Promise((resolve, reject) => {
			article.save(err => err ? reject(err) : resolve());
		}),
};


module.exports = articleModel;
