module.exports = function(sockSrv, options){
	var express = require('express');
	var router = express.Router();
	
	router.get('/getPending', (req, res) => res.send(sockSrv.pendingRequests));
	router.get('/getClients', (req, res) => res.send(Object.keys(sockSrv.clients)));

	router.get('/:event', (req, res) => {
		if(!req.query.id){
			res.send('no id');
			return;
		}
	
		const id = req.query.id;
		var data = req.query;
		delete data.id;
	
		sockSrv.sendRequest(id, req.params.event, data, (response) => {
			res.json(response)
		})
	
	});

	return router;
};