const mongoose = require('mongoose');
require('../utils/db');


const authSchema = new mongoose.Schema({
	username:  String,
	salt:      { type: String, default: "" },
	auth:      { type: [], default: [] },
	pwdHash:   { type: String, default: "" },
	profileId: String
});

const Auth = mongoose.model('Auth', authSchema);

const authModel = {
	/* params = {username, salt, pwdHash} */
	create: (params) => {
		const auth = new Auth(params);

		return authModel.saveOne(auth);
	},

	/* params = {username} */
	findOneByUsername: (params) =>
		new Promise((resolve, reject) => {
			Auth.findOne(params, (err, auth) => err ? reject(err) : resolve(auth));
		}),

	/* params = {thirdPartyName, username} */
	findOneByAuth: (params) =>
		new Promise((resolve, reject) => {
			Auth.findOne({
				"auth.name": params.thirdPartyName,
				"auth.username": params.username
			}, (err, auth) => err ? reject(err) : resolve(auth));
		}),

	/* params = {profileId} */
	findAuthByProfileId: (params) =>
		new Promise((resolve, reject) => {
			Auth.findOne(params, "auth", (err, auth) => err ? reject(err) : resolve(auth));
		}),

	/* params = {username} */
	removeOneByUsername: (params) =>
		new Promise((resolve, reject) => {
			Auth.remove(params, (err, auth) => err ? reject(err) : resolve());
		}),

	saveOne: (auth) =>
		new Promise((resolve, reject) => {
			auth.save(err => err ? reject(err) : resolve());
		}),
};


module.exports = authModel;
