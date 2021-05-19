module.exports = function(sockSrv, options){
	var express = require('express');
	var router = express.Router();
	
	router.get('/getPending', (req, res) => res.send(sockSrv.pendingRequests));
	router.get('/getClients', (req, res) => res.send(Object.keys(sockSrv.clients)));

	router.get('/:id/:event', (req, res) => {
		
		sockSrv.sendRequest(req.params.id, req.params.event, req.query, (resp) => {
			res.json(resp);
		})
	
	});

	return router;
};