const profileModel = require('../models/profileModel');
const helpers = require('../utils/helpers');


const followingService = {
	/* params = {userId, followingId} */
	/* results = {following} */
	followById: (params) => {
		/*
		 a) add [username] and [userId] to current user's [following] list
		 */
		if (params.userId === params.followingId)
			return Promise.reject(helpers.generateError(400, 'Cannot follow yourself.'));

		let followingProfile;
		let userProfile;
		return profileModel.findOneById({ _id: params.followingId })
			.then(profile => {
				if (!profile) return Promise.reject(helpers.generateError(400, 'No such user.'));

				followingProfile = profile;

				return profileModel.findOneById({ _id: params.userId });
			})
			.then(res => {
				userProfile = res;

				// check duplication
				if (res.following.find(v => "" + v.userId === "" + followingProfile._id))
					return Promise.reject(helpers.generateError(400, 'Cannot follow a user twice.'));

				// add to following list
				res.following.push({
					userId: params.followingId,
					username: followingProfile.username
				});

				return profileModel.saveOne(res);
			})
			.then(() => userProfile.following.map(v => v.userId));
	},

	/* params = {userId, followingUsername} */
	/* results = {newFollowing} */
	followByUsername: (params) => {
		/*
		 a) add [username] and [userId] to current user's [following] list
		 */
		let followingProfile;
		return profileModel.findOneByUsername({ username: params.followingUsername })
			.then(profile => {
				if (!profile) return Promise.reject(helpers.generateError(400, 'No such user.'));

				if (profile._id == params.userId)
					return Promise.reject(helpers.generateError(400, 'Cannot follow yourself.'));

				followingProfile = profile;

				return profileModel.findOneById({ _id: params.userId });
			})
			.then(res => {
				// check duplication
				if (res.following.find(v => v.username == followingProfile.username))
					return Promise.reject(helpers.generateError(400, 'Cannot follow a user twice.'));

				// add to following list
				res.following.push({
					userId: followingProfile._id,
					username: params.followingUsername
				});

				return profileModel.saveOne(res);
			})
			.then(() => {
				return {
					_id: followingProfile._id,
					username: followingProfile.username,
					headline: followingProfile.headline,
					avatar: followingProfile.avatar
				}
			});
	},

	/* params = {userId} */
	/* results = {following} */
	retrieve: (params) => {
		/*
		 a) retrieve [following] of the given user
		 */
		return profileModel.findFollowingById({ _id: params.userId })
			.then(res => {
				return {
					username: res.username,
					following: res.following.map(v => v.userId)
				}
			});
	},

	/* params = {userId} */
	/* results = {following} */
	retrieveMy: (params) => {
		/*
		 a) retrieve all [following] of the logged-in user
		 */
		return profileModel.findFollowingById({ _id: params.userId })
			.then(res => {
				const promises = res.following.map(f => profileModel.findBriefById2({ _id: f.userId }));

				return Promise.all(promises);
			});
	},

	/* params = {userId, followingId} */
	/* results = {following} */
	remove: (params) => {
		/*
		 a) remove a user from the [following] of the logged-in user
		 */
		let retProfile;
		return profileModel.findOneById({ _id: params.userId })
			.then(profile => {
				retProfile = profile;

				const oldLen = profile.following.length;

				// remove from following
				profile.following = profile.following.filter(f => f.userId != params.followingId);

				// check whether a removal really happened
				if (profile.following.length === oldLen)
					return Promise.reject(helpers.generateError(400, 'No such following.'));

				return profileModel.saveOne(profile);
			})
			.then(() => retProfile.following.map(v => v.userId));

	},
};

module.exports = followingService;
