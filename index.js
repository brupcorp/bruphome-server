const express = require('express')
const app = express().use(express.json()).use(express.urlencoded({ extended: true }))
const smarthome = require('./smarthome');

app.use(require('morgan')('dev'));

app.get('/triggersync', (req, res) => {
	smarthome.requestSync('keksimusmaximus1234').then((resp) => res.json({ok: resp}));
})

app.get('/fakeauth', async (req, res) => {
	console.debug('client_id:', req.query.client_id);
	return res.redirect(req.query.redirect_uri + '?code=supersecureauthcode&state=' + req.query.state);
});

app.all('/faketoken', async (req, res) => {
	const grantType = req.query.grant_type ? req.query.grant_type : req.body.grant_type;
	console.debug('grantType:', grantType, 'authCode;', req.body.code)
	const secondsInDay = 60 * 60 * 24;
	let token;

	switch(grantType) {
		case 'authorization_code':
			token = {
				token_type: 'bearer',
				access_token: '123access',
				refresh_token: '123refresh',
				expires_in: secondsInDay,
			};
			break;
		case 'refresh_token':
			token = {
				token_type: 'bearer',
				access_token: '123access',
				expires_in: secondsInDay,
			};
			break;
	}

	res.json(token);
});

app.post('/fulfillment', smarthome)

app.listen(3000)