const mongoose = require('mongoose');
require('../utils/db');


const followingSchema = new mongoose.Schema({
	username: String,
	userId: String
});

const profileSchema = new mongoose.Schema({
	username:    String,
	displayName: { type: String, default: "" },
	email:       { type: String, default: "" },
	phone:       { type: String, default: "" },
	dob:         { type: String, default: "" },
	zipcode:     { type: String, default: "" },
	headline:    { type: String, default: "I'm feeling good." },
	avatar:      { type: String, default: "http://res.cloudinary.com/dkuxfjcdo/image/upload/v1512169304/default_avatar_zdbqfi.jpg" },
	following:   { type: [followingSchema], default: [] }
});

const Profile = mongoose.model('profile', profileSchema);

const profileModel = {
	/* params = {username, displayName, email, phone, dob, zipcode} */
	create: (params) =>
		new Promise((resolve, reject) => {
			let newProfile = new Profile(params);
			newProfile.save(err => err ? reject(err) : resolve(newProfile._id));
		}),

	/* params = {_id, headline} */
	updateHeadlineById: (params) =>
		new Promise((resolve, reject) => {
			Profile.update({ _id: params._id }, { headline: params.headline },
				err => err ? reject(err) : resolve());
		}),

	/* params = {_id} */
	findHeadlineById: (params) =>
		new Promise((resolve, reject) => {
			Profile.findById(params._id, '-_id username headline',
				(err, results) => err ? reject(err) : resolve(results));
		}),

	/* params = {_id, email} */
	updateEmailById: (params) =>
		new Promise((resolve, reject) => {
			Profile.update({ _id: params._id }, { email: params.email },
				err => err ? reject(err) : resolve());
		}),

	/* params = {_id} */
	findEmailById: (params) =>
		new Promise((resolve, reject) => {
			Profile.findById(params._id, '-_id username email',
				(err, results) => err ? reject(err) : resolve(results));
		}),
	/* params = {_id, zipcode} */
	updateZipcodeById: (params) =>
		new Promise((resolve, reject) => {
			Profile.update({ _id: params._id }, { zipcode: params.zipcode },
				err => err ? reject(err) : resolve());
		}),

	/* params = {_id} */
	findZipcodeById: (params) =>
		new Promise((resolve, reject) => {
			Profile.findById(params._id, '-_id username zipcode',
				(err, results) => err ? reject(err) : resolve(results));
		}),

	/* params = {_id, phone} */
	updatePhoneById: (params) =>
		new Promise((resolve, reject) => {
			Profile.update({ _id: params._id }, { phone: params.phone },
				err => err ? reject(err) : resolve());
		}),

	/* params = {_id} */
	findPhoneById: (params) =>
		new Promise((resolve, reject) => {
			Profile.findById(params._id, '-_id username phone',
				(err, results) => err ? reject(err) : resolve(results));
		}),

	/* params = {_id} */
	findDobById: (params) =>
		new Promise((resolve, reject) => {
			Profile.findById(params._id, '-_id username dob',
				(err, results) => err ? reject(err) : resolve(results));
		}),

	/* params = {_id} */
	findAvatarById: (params) =>
		new Promise((resolve, reject) => {
			Profile.findById(params._id, '-_id username avatar',
				(err, results) => err ? reject(err) : resolve(results));
		}),

	/* params = {_id, avatar} */
	updateAvatarById: (params) =>
		new Promise((resolve, reject) => {
			Profile.update({ _id: params._id }, { avatar: params.avatar },
				err => err ? reject(err) : resolve());
		}),

	/* params = {_id} */
	findFollowingById: (params) =>
		new Promise((resolve, reject) => {
			Profile.findById(params._id, '-_id username following',
				(err, results) => err ? reject(err) : resolve(results));
		}),

	/* params = {_id} */
	findBriefById: (params) =>
		new Promise((resolve, reject) => {
			Profile.findById(params._id, '-_id username headline avatar following',
				(err, results) => err ? reject(err) : resolve(results));
		}),

	/* params = {_id} */
	findBriefById2: (params) =>
		new Promise((resolve, reject) => {
			Profile.findById(params._id, 'username headline avatar',
				(err, results) => err ? reject(err) : resolve(results));
		}),

	/* params = {_id} */
	findOneById: (params) =>
		new Promise((resolve, reject) => {
			Profile.findById(params._id, (err, profile) => err ? reject(err) : resolve(profile))
		}),

	/* params = {username} */
	findOneByUsername: (params) =>
		new Promise((resolve, reject) => {
			Profile.findOne(params, (err, profile) => err ? reject(err) : resolve(profile))
		}),

	/* params = {username} */
	removeOneByUsername: (params) =>
		new Promise((resolve, reject) => {
			Profile.remove(params, (err, auth) => err ? reject(err) : resolve());
		}),

	saveOne: (profile) =>
		new Promise((resolve, reject) => {
			profile.save(err => err ? reject(err) : resolve())
		})
};


module.exports = profileModel;
