const authModel = require('../models/authModel');
const profileModel = require('../models/profileModel');
const articleModel = require('../models/articleModel');
const sessionAuthenticator = require('../middlewares/sessionAuthenticator');
const helpers = require('../utils/helpers');


const thirdPartyService = {
	/* params = {thirdPartyUsername} */
	/* results = {result, username, sid} */
	logIn: (params, thirdPartyName) => {
		/*
		 a) try to find by username
		 b) try to find by auth
		 */
		return Promise.all([
			authModel.findOneByUsername({ username: params.thirdPartyUsername + "@" + thirdPartyName }),
			authModel.findOneByAuth({ username: params.thirdPartyUsername, thirdPartyName: thirdPartyName })
		])
			.then(res => {
				if (res[0] || res[1]) {
					const id = res[0] ? res[0].profileId : res[1].profileId;
					const username = res[0] ? res[0].username : res[1].username;

					// store session
					const key = sessionAuthenticator.set({
						id: id,
						username: username
					});

					return {
						result: "success",
						username: username,
						sid: key
					};
				} else {
					return {
						result: "fail"
					};
				}
			});
	},

	/* params = {thirdPartyUsername} */
	/* results = {username, sid} */
	register: (params, thirdPartyName) => {
		/*
		 a) create a new 'profile'
		 b) create a new 'auth'
		 c) login as new account
		 */
		const username = params.thirdPartyUsername + "@" + thirdPartyName;

		let retProfileId;
		return profileModel.create({ username: username })
			.then(profileId => {
				retProfileId = profileId;

				return authModel.create({
					username:  username,
					profileId: profileId
				});
			})
			.then(() => {
				// store session
				const key = sessionAuthenticator.set({
					id: retProfileId,
					username: username
				});

				return {
					username: username,
					sid: key
				};
			});
	},

	/* params = {username, thirdPartyUsername} */
	/* results = {username} */
	link: (params, thirdPartyName) => {
		/*
		 a) update [auth]
		 b) merge all 'article's
		 c) delete third-party 'profile' & 'auth'
		 */
		const thirdPartyAccountUsername = params.thirdPartyUsername + '@' + thirdPartyName;

		let retProfileId;
		return authModel.findOneByAuth({
			thirdPartyName: thirdPartyName,
			username: params.thirdPartyUsername
		})
			.then(res => {
				// check if the third-party account has been linked to other local account
				if (res) return Promise.reject(helpers.generateError(400, 'Already linked to other account.'));

				return authModel.findOneByUsername({ username: params.username });
			})
			.then(res => {
				// check if this local account has linked to other account from this third-party
				if (res.auth.find(a => a.name === thirdPartyName))
					return Promise.reject(helpers.generateError(400, 'Already linked to this third-party.'));

				retProfileId = res.profileId;

				// link
				res.auth.push({ name: thirdPartyName, username: params.thirdPartyUsername });

				return authModel.saveOne(res);
			})
			.then(() => articleModel.updateAllByAuthor({
				author: thirdPartyAccountUsername,
				newAuthor: params.username,
				newAuthorId: retProfileId
			}))
			.then(res => Promise.all([
				authModel.removeOneByUsername({ username: thirdPartyAccountUsername }),
				profileModel.removeOneByUsername({ username: thirdPartyAccountUsername })
			]));
	},

	/* params = {username} */
	/* results = {username} */
	unlink: (params, thirdPartyName) => {
		/*
		 a) update [auth]
		 */
		return authModel.findOneByUsername({ username: params.username })
			.then(res => {
				const oldLen = res.auth.length;

				res.auth = res.auth.filter(a => a.name !== thirdPartyName);

				// check whether a removal really happened
				if (res.auth.length === oldLen)
					return Promise.reject(helpers.generateError(400, 'No such link.'));

				return authModel.saveOne(res);
			});
	},

	/* params = {username, password, thirdPartyAccountUsername} */
	/* results = {username} */
	linkLocal: (params, thirdPartyName) => {
		/*
		 a) verify identity
		 c) link
		 d) login as new account
		 */
		let retProfileId;
		return authModel.findOneByUsername({ username: params.username })
			.then((auth) => {
				if (!auth)
					return Promise.reject(helpers.generateError(400, 'No such user.'));
				else if (helpers.generateHashedSaltedPwd(auth.salt, params.password) !== auth.pwdHash)
					return Promise.reject(helpers.generateError(400, 'Wrong password.'));

				retProfileId = auth.profileId;

				return thirdPartyService.link({
					username: params.username,
					thirdPartyUsername: params.thirdPartyAccountUsername.split('@')[0]
				}, thirdPartyName);
			})
			.then(() => {
				const key = sessionAuthenticator.set({
					id: retProfileId,
					username: params.username
				});

				return {
					username: params.username,
					sid: key
				};
			});
	}
};


module.exports = thirdPartyService;
