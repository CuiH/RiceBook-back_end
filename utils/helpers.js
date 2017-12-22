const md5 = require('md5');

const values = require('./values');


const helpers = {
	generateSalt: () =>
		new Array(values.salt.len).fill(1).map(() => {
			const index = Math.floor(Math.random() * values.salt.dict.length);

			return values.salt.dict[index];
		}).join(''),

	generateHashedSaltedPwd: (salt, pwd) => md5(pwd + salt),

	generateError: (status, message) => {
		let err = new Error(message);
		err.status = status;

		return err;
	},

	generateSuccessRedirectHTML: (page, username) => {
		if (page === "main")
			return "<html><body>Authentication succeeded! Redirecting..." +
				"<script>setInterval(() => window.location = '" +
				values.frontEndUrl + "/#/landing?cb=" + username + "', 1500)</script>" +
				"</body></html>";
		else
			return "<html><body>Link succeeded! Redirecting..." +
				"<script>setInterval(() => window.location = '" +
				values.frontEndUrl + "/#/profile', 1500)</script>" +
				"</body></html>";

	},

	generateFailureRedirectHTML: () => {
		return "<html><body>Authentication failed! Redirecting..." +
			"<script>setInterval(() => window.location = '" +
			values.frontEndUrl + "/#/landing" + "', 1500)</script>" +
			"</body></html>";
	}
};


module.exports = helpers;