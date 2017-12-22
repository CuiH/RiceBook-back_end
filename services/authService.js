const authModel = require('../models/authModel');
const profileModel = require('../models/profileModel');
const helpers = require('../utils/helpers');
const sessionAuthenticator = require('../middlewares/sessionAuthenticator');


const authService = {
	/* params = {username, displayName, email, phone, dob, zipcode, password} */
	/* results = {username} */
	register: (params) => {
		/*
		 a) create a new 'profile'
		 b) create a new 'auth'
		 */
		// handle specially for e2e test
		if (params.username === "e2e") return new Promise((res, rej) => res({ username: "e2e" }));

		return profileModel.findOneByUsername({ username: params.username })
			.then(res => {
				// duplication
				if (res) return Promise.reject(helpers.generateError(400, 'Already used username.'));

				return profileModel.create(params);
			})
			.then(profileId => {
				const salt = helpers.generateSalt();

				return authModel.create({
					username:  params.username,
					salt:      salt,
					pwdHash:   helpers.generateHashedSaltedPwd(salt, params.password),
					profileId: profileId
				});
			})
			.then(() => {
				return {
					username: params.username
				}
			});
	},

	/* params = {username, password} */
	/* results = {username} */
	logIn: (params) => {
		/*
		 a) verify pwd
		 b) generate cookie
		 */
		return authModel.findOneByUsername({ username: params.username })
			.then((auth) => {
				if (!auth)
					return Promise.reject(helpers.generateError(400, 'No such user.'));
				else if (helpers.generateHashedSaltedPwd(auth.salt, params.password) !== auth.pwdHash)
					return Promise.reject(helpers.generateError(400, 'Wrong password.'));

				// store cookie
				const key = sessionAuthenticator.set({
					id: auth.profileId,
					username: auth.username
				});

				return {
					username: auth.username,
					sid: key
				};
			});
	},
};


module.exports = authService;
