import chalk from "chalk";
import { randomBytes } from "crypto";
import { mkLog } from "../utils/util";

const log = mkLog('BrupHome', chalk.bgMagenta);

const clients = {};
var pendingRequests = [];

export default {
	clients,
	pendingRequests,
	sendRequest: function (id, eventName, data, callback) {
		if (!clients[id]) {
			callback({ error: 'invalid id' });
			return;
		}

		let timeout;
		const reqID = randomBytes(5).toString('hex');

		clients[id].on(reqID, (data) => {
			clients[id].removeAllListeners(reqID);
			clearTimeout(timeout);
			pendingRequests = pendingRequests.filter(el => el !== reqID);
			callback(data);
			log(" - [REQ] completed request:", reqID);
		})

		log(" - [REQ] sent request:", reqID);
		pendingRequests.push(reqID);
		clients[id].emit(eventName, { requestID: reqID, data });

		timeout = setTimeout(() => {
			if (!clients[id]) return callback({ error: 'no response' });
			clients[id].removeAllListeners(reqID);
			pendingRequests = pendingRequests.filter(el => el !== reqID);
			callback({ error: 'no response' });
			log(" - ERROR - [REQ] timeout request:", reqID);
		}, 30000);

	},
	handler: function (socket) {

		socket.on('handshake', (data) => {

			if (clients[data.id]) {
				socket.disconnect();
				log(" - ERROR - controller with duplicate id: '" + data.id + "' tried to connect! rejected...")
				return;
			}

			log("controller connected:", data);
			clients[data.id] = socket;

			socket.on("disconnect", () => {
				var clientID = Object.keys(clients).find(key => clients[key] === socket); // javascript hack - key by value
				delete clients[clientID];
				log("controller disconnected", clientID);
			})

		})

	}
};

