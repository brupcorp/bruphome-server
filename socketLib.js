module.exports = function(server, options){
	const { Server } = require("socket.io");
	const io = new Server(server, { allowEIO3: true });
	var crypto = require("crypto");

	const clients = {};
	var pendingRequests = [];

	io.on('connection', (socket) => {

		socket.on('handshake', (data) => {

			if(clients[data.id]) {
				socket.disconnect();
				console.error("[WEBSOCK] controller with duplicate id: '" + data.id +  "' tried to connect! rejected...")
				return;
			}

			console.log("[WEBSOCK] controller connected:", data);
			clients[data.id] = socket;
	
			socket.on("disconnect", () => {
				var clientID = Object.keys(clients).find(key => clients[key] === socket); // javascript hack - key by value
				delete clients[clientID];
				console.log("[WEBSOCK] controller disconnected", clientID);
			})
	
		})
	
	});

	return {
		clients,
		pendingRequests,
		sendRequest: function(id, eventName, data, callback){
			if(!clients[id]){
				callback({error: 'invalid id'});
				return;
			}

			let timeout;
			const reqID = crypto.randomBytes(5).toString('hex');
			
			clients[id].on(reqID, (data) => {
				clients[id].removeAllListeners(reqID);
				clearTimeout(timeout);
				pendingRequests = pendingRequests.filter(el => el !== reqID);
				callback(data);
				console.log("[WEBSOCK] [REQ] completed request:", reqID);
			})

			console.log("[WEBSOCK] [REQ] sent request:", reqID);
			pendingRequests.push(reqID);
			clients[id].emit(eventName, { requestID: reqID, data });
		
			timeout = setTimeout(() => {
				clients[id].removeAllListeners(reqID);
				pendingRequests = pendingRequests.filter(el => el !== reqID);
				callback({error: 'no response'});
				console.error("[WEBSOCK] [REQ] timeout request:", reqID);
			}, 30000);

		}
	};

}