var express = require('express');
var router = express.Router();

router.get('/fakeauth', async (req, res) => {
	console.debug('client_id:', req.query.client_id);
	return res.redirect(req.query.redirect_uri + '?code=supersecureauthcode&state=' + req.query.state);
});

//todo: fix oauth2
router.all('/faketoken', async (req, res) => {
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

module.exports = router;