const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const authController = require('./controllers/authController');
const articleController = require('./controllers/articleController');
const profileController = require('./controllers/profileController');
const followingController = require('./controllers/followingController');
const thirdPartyController = require('./controllers/thirdPartyController');
const sessionAuthenticator = require('./middlewares/sessionAuthenticator');
const helpers = require('./utils/helpers');


const app = express();

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.headers.origin);
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Headers", "Content-Type");
	res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");

	next();
});

app.use((req, res, next) => {
	if (req.method === 'OPTIONS') res.status(200).send();
	else next();
});

app.use(cookieParser());
app.use(bodyParser.json());

app.use(authController);
app.use(thirdPartyController);

app.use(sessionAuthenticator.receive);

app.use(articleController);
app.use(followingController);
app.use(profileController);

// catch 404
app.use((req, res, next) => {
	next(helpers.generateError(404, "Not found."));
});

// error handler
app.use((err, req, res, next) => {
	console.log(err);

	res.status(err.status || 500);

	res.json({ result: "error", message: err.message });
});


module.exports = app;
