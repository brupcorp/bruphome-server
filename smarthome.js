const fs = require('fs');
const path = require('path');
const { smarthome } = require('actions-on-google')

// Create an app instance
const app = smarthome({ jwt: require('./serviceKey.json') });

// Register handlers for Smart Home intents

let on = false;

app.onExecute((body, headers) => {
	console.debug('ExecuteRequest:', body.inputs[0].payload.commands[0]);
	console.debug('userkey:', headers.authorization);

	on = body.inputs[0].payload.commands[0].execution[0].params.on;
	console.log("onstate", on);

	return {
		requestId: body.requestId,
		payload: {
			commands: [{
				"ids": ["123"],
				"status": "SUCCESS"
			}],
		},
	}
})

app.onQuery((body, headers) => {
	console.debug('QueryRequest:', body.inputs[0].payload);
	console.debug('userkey:', headers.authorization);

	return {
		requestId: body.requestId,
		payload: {
			devices:
			{
				"123": {
					"on": on,
					"online": true,
					"status": "SUCCESS"
				}
			}
			,
		},
	}
})

app.onSync((body, headers) => {
	console.debug('SyncRequest');
	console.debug('userkey:', headers.authorization);

	return {
		requestId: body.requestId,
		payload: {
			agentUserId: 'keksimusmaximus1234',
			devices: [{
				"id": "123",
				"type": "action.devices.types.LIGHT",
				"traits": ["action.devices.traits.OnOff"],
				"willReportState": false,
				"name": {
					"name": "ESP_Board_01"
				},
				"deviceInfo": {
					"manufacturer": "brupcorp",
					"model": "esp-client01",
					"hwVersion": "1.2",
					"swVersion": "v1.0"
				}
			}]
		}
	}
})

module.exports = app;