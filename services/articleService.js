const articleModel = require('../models/articleModel');
const profileModel = require('../models/profileModel');
const helpers = require('../utils/helpers');
const uploadImage = require('../utils/cloudinary');


const articleService = {
	/* params = {username, userId, text, *imageStream} */
	/* results = {article} */
	post: (params, needAllFeeds) => {
		/*
		 a) *upload image
		 b) create a new 'article'
		 b) *find all feeds
		 */
		if (params.imageStream) {
			return uploadImage(params.imageStream)
				.then(res => {
					if (res.error) return Promise.reject(helpers.generateError(400, "Fail to upload image."));

					return articleModel.create({
						author: params.username,
						authorId: params.userId,
						text: params.text,
						image: res.url
					});
				})
				.then(article => needAllFeeds ? articleService.retrieve({ userId: params.userId }) : article);
		} else {
			return articleModel.create({
				author: params.username,
				authorId: params.userId,
				text: params.text
			})
				.then(article => needAllFeeds ? articleService.retrieve({ userId: params.userId }) : article);
		}
	},

	/* params = {articleId, userId, username, text, *commentId} */
	/* results = {article} */
	modify: (params, needAllFeeds) => {
		/*
		 a) find the 'article'
		 b) modify according to the [commentId] field, and check authentication
		 *c) find all feeds
		 */
		let retArticle;
		return articleModel.findOneById({ _id: params.articleId })
			.then(article => {
				if (!article) return Promise.reject(helpers.generateError(400, 'No such article.'));

				retArticle = article;

				if (!params.commentId) {
					if (article.author !== params.username)
						return Promise.reject(helpers.generateError(401, 'Unauthorized.'));

					// update article
					article.text = params.text;
				} else if (params.commentId === "-1" || params.commentId === -1) {
					// post a new comment
					article.comments.push({
						author:     params.username,
						authorId:   params.userId,
						createTime: new Date(),
						text:       params.text
					});
				} else {
					// check comment existence
					let comment = article.comments.id(params.commentId);
					if (!comment)
						return Promise.reject(helpers.generateError(400, 'No such comment.'));

					if (comment.author !== params.username)
						return Promise.reject(helpers.generateError(401, 'Unauthorized.'));

					// update comment
					comment.text = params.text;
				}

				return articleModel.saveOne(article);
			})
			.then(() => needAllFeeds ? articleService.retrieve({ userId: params.userId }) : retArticle);
	},

	/* params = {userId, id} */
	/* results = {articles} */
	retrieve: (params) => {
		/*
		 a) retrieve 'article's according to the [id] field
		 */
		if (!params.id) {
			// return current user's feeds
			return profileModel.findFollowingById({ _id: params.userId })
				.then(res => {
					let authorIds = [ params.userId ];

					// get all followings' ids
					res.following.forEach(f => authorIds.push(f.userId));

					return articleModel.findAllByAuthorId({ authorId: authorIds });
				})
				.then(articleLists => {
					let articles = [];

					articleLists.forEach(list => articles = articles.concat(list));

					return articles;
				});
		} else {
			return articleModel.findOneById({ _id: params.id})
				.then(res => res ? res : articleModel.findAllByAuthorId({ authorId: params.id }));
		}
	},
};


module.exports = articleService;
