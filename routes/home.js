import { Router } from 'express';
import { compose } from '../utils/middlewares';
import smarthome from '../home/smarthome';
const app = Router();

import controller from '../home/socketlayer';

app.get('/getPending', (req, res) => res.send(controller.pendingRequests));
app.get('/getClients', (req, res) => res.send(Object.keys(controller.clients)));

app.all('/fulfillment', smarthome);
app.get('/oauth', async (req, res) => {
	console.debug('client_id:', req.query.client_id);
	return res.redirect(req.query.redirect_uri + '?code=supersecureauthcode&state=' + req.query.state);
});

//todo: fix oauth2
app.all('/oauth-token', async (req, res) => {
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

app.get('/:id/:event', (req, res) => {
	
	controller.sendRequest(req.params.id, req.params.event, req.query, (resp) => {
		res.json(resp);
	})

});

app.post('/:id/:event', (req, res) => {
	
	controller.sendRequest(req.params.id, req.params.event, req.body, (resp) => {
		res.json(resp);
	})

});

app.get('*', compose({entry: './react/home/index.html', prod: false, preact: true}))

export const routePath = '/home';
export const router = app;
export const socketio = controller.handler;