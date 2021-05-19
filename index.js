const express = require('express');
const app = express();
const server = require('http').createServer(app);
const smarthome = require('./smarthome');
const sockSrv = require('./socketLib')(server);

app.use(require('morgan')('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/oauth', require('./routes/oauth'));
app.use('/controller', require('./routes/event')(sockSrv));

app.get('/triggersync', (req, res) => {
	smarthome.requestSync('keksimusmaximus1234').then((resp) => res.json({ok: resp}));
})

app.post('/fulfillment', smarthome);

server.listen(3000, function(){
	console.log('running brupManager v1 at 0.0.0.0:3000');
});