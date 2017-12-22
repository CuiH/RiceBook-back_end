const expect = require('chai').expect;
const fetch = require("isomorphic-fetch");


let sid;

const url = path => "http://localhost:3000" + path;

const options = (method, data) => {
	let req = {
		method: method,
		headers: {
			'Content-Type': 'application/json'
		},
		body: ''
	};

	if (sid) req.headers['Cookie'] = "sid=" + sid;
	if (data) req.body = JSON.stringify(data);

	return req;
};

describe('Validate Article', () => {

	before((done) => {
		fetch(url("/login"), options("POST", {
			username: "unit",
			password: "a-weak-pwd"
		}))
			.then((res) => {
				sid = res.headers._headers['set-cookie'][0].split(';')[0].split('=')[1];

				done();
			})
			.catch(done);
	});

	it('should update the headline', (done) => {
		const newHeadline = "This is the new headline.";

		fetch(url("/headlines"), options("GET"))
			.then(res => {
				expect(res.status).to.eql(200);

				return res.json();
			})
			.then(res => {
				expect(res.headlines[0].headline).to.not.eql(newHeadline);

				return fetch(url("/headline"), options("PUT", { headline: newHeadline }));
			})
			.then(res => {
				expect(res.status).to.eql(200);

				return fetch(url("/headlines"), options("GET"));
			})
			.then(res => {
				expect(res.status).to.eql(200);

				return res.json();
			})
			.then(res => {
				expect(res.headlines[0].headline).to.eql(newHeadline);
			})
			.then(done)
			.catch(done);
	});

	it('should post a new article', (done) => {
		const text = "This is the new article.";

		let oldCount;

		fetch(url("/articles"), options("GET"))
			.then(res => {
				expect(res.status).to.eql(200);

				return res.json();
			})
			.then(res => {
				oldCount = res.articles.length;

				return fetch(url("/article"), options("POST", { text: text }));
			})
			.then(res => {
				expect(res.status).to.eql(200);

				return res.json();
			})
			.then(res => {
				expect(res.articles[0].text).to.eql(text);

				return fetch(url("/articles"), options("GET"))
			})
			.then(res => {
				expect(res.status).to.eql(200);

				return res.json();
			})
			.then(res => {
				expect(res.articles.length).to.eql(oldCount + 1);
			})
			.then(done)
			.catch(done);
	});

	after((done) => {
		fetch(url("/headline"), options("PUT", { headline: "I'm felling good." }))
			.then(() => fetch(url("/logout"), options("PUT")))
			.then(() => {
				done();
			})
			.catch(done);
	});

});
