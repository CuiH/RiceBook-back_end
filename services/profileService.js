const profileModel = require('../models/profileModel');
const authModel = require('../models/authModel');
const helpers = require('../utils/helpers');
const uploadImage = require('../utils/cloudinary');


const profileService = {
	/* params = {userId, headline} */
	/* results = {} */
	updateHeadline: (params) => {
		/*
		 a) update [headline] of the logged-in user
		 */
		return profileModel.updateHeadlineById({
			_id: params.userId,
			headline: params.headline
		});
	},

	/* params = {userIds} */
	/* results = {headlines} */
	retrieveHeadlines: (params) => {
		/*
		 a) retrieve [headline]s according to [userId]s
		 */
		const userIds = params.userIds.trim().replace(' ', '').split(',');
		let promises = userIds.map(v => profileModel.findHeadlineById({ _id: v }));

		return Promise.all(promises);
	},

	/* params = {userId, email} */
	/* results = {} */
	updateEmail: (params) => {
		/*
		 a) update [email] of the logged-in user
		 */
		return profileModel.updateEmailById({
			_id: params.userId,
			email: params.email
		});
	},

	/* params = {userId} */
	/* results = {username, email} */
	retrieveEmail: (params) => {
		/*
		 a) retrieve [email] according to [id]
		 */
		return profileModel.findEmailById({ _id: params.userId })
			.then(res => res ? res : Promise.reject(helpers.generateError(400, "No such user.")));
	},

	/* params = {userId, zipcode} */
	/* results = {} */
	updateZipcode: (params) => {
		/*
		 a) update [zipcode] of the logged-in user
		 */
		return profileModel.updateZipcodeById({
			_id: params.userId,
			zipcode: params.zipcode
		});
	},

	/* params = {userId} */
	/* results = {username, zipcode} */
	retrieveZipcode: (params) => {
		/*
		 a) retrieve [zipcode] according to [id]
		 */
		return profileModel.findZipcodeById({ _id: params.userId })
			.then(res => res ? res : Promise.reject(helpers.generateError(400, "No such user.")));
	},

	/* params = {userId, phone} */
	/* results = {} */
	updatePhone: (params) => {
		/*
		 a) update [phone] of the logged-in user
		 */
		return profileModel.updatePhoneById({
			_id: params.userId,
			phone: params.phone
		});
	},

	/* params = {userId} */
	/* results = {username, phone} */
	retrievePhone: (params) => {
		/*
		 a) retrieve [phone] according to [id]
		 */
		return profileModel.findPhoneById({ _id: params.userId })
			.then(res => res ? res : Promise.reject(helpers.generateError(400, "No such user.")));
	},

	/* params = {userId} */
	/* results = {username, dob} */
	retrieveDob: (params) => {
		/*
		 a) retrieve [dob]
		 */
		return profileModel.findDobById({ _id: params.userId })
			.then(res =>  {
				if (!res) return Promise.reject(helpers.generateError(400, "No such user."));

				return {
					username: res.username,
					dob: new Date(res.dob).getTime()
				}
			});
	},

	/* params = {userId, avatarStream} */
	/* results = {avatar} */
	updateAvatar: (params) => {
		/*
		 a) update [avatar] of the logged-in user
		 */
		let retUrl;
		return uploadImage(params.avatarStream)
			.then(res => {
				if (res.error) return Promise.reject(helpers.generateError(400, "Fail to upload image."));

				retUrl = res.url;

				profileModel.updateAvatarById({
					_id: params.userId,
					avatar: retUrl
				})
			})
			.then(() => retUrl);
	},

	/* params = {userIds} */
	/* results = {avatars} */
	retrieveAvatar: (params) => {
		/*
		 a) retrieve [avatar]s according to [userId]s
		 */

		const userIds = params.userIds.trim().replace(' ', '').split(',');
		let promises = userIds.map(v => profileModel.findAvatarById({ _id: v }));

		return Promise.all(promises);
	},

	/* params = {userId} */
	/* results = {brief} */
	retrieveBrief: (params) => {
		/*
		 a) retrieve [username], [followingCount], [headline], [avatar]
		 */
		return profileModel.findBriefById({ _id: params.userId })
			.then(res => {
				if (!res) return Promise.reject(helpers.generateError(400, "No such user."));

				let brief = JSON.parse(JSON.stringify(res));
				brief.followingCount = brief.following.length;
				delete brief.following;

				return brief;
			});
	},

	/* params = {userId} */
	/* results = {user} */
	retrieveDetail: (params) => {
		/*
		 a) retrieve all except [following]
		 b) find all third-party auth
		 */
		let retProfile;

		return profileModel.findOneById({ _id: params.userId })
			.then(res => {
				if (!res) return Promise.reject(helpers.generateError(400, "No such user."));

				let profile = JSON.parse(JSON.stringify(res));
				delete profile.following;

				retProfile = profile;

				return authModel.findAuthByProfileId({ profileId: params.userId });
			})
			.then(res => {
				retProfile.auth = res.auth;

				return retProfile;
			});
	},
};

module.exports = profileService;
