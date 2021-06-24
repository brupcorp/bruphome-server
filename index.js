import express, { urlencoded, json } from 'express';
import { createServer } from 'http';
import { join } from 'path';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import serveFavicon from 'serve-favicon';
import chalk from 'chalk';
import { mkLog } from './utils/util';

const app = express();
const server = createServer(app);
const io = new Server(server, { allowEIO3: true });

const routes = join(__dirname, '/routes');

const log = mkLog('httpd', chalk.green);

// middlewares
app.use(require('morgan')('dev'));
app.use(serveFavicon('./public/favicon.png'));
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(json());

const files = require('fs').readdirSync(routes);

for(const file of files){
	const route = require(join(routes, file));
	app.use(route.routePath, route.router);
	log('file', file, 'registered router for', route.routePath);
	if(route.socketio){
		io.of(route.routePath).on('connection', route.socketio);
		log('file', file, 'registered socketio for namespace', route.routePath);
	}
}

app.get('*', (_, res) => res.status(404).sendFile(__dirname + '/public/404.html'));

// only allow localhost to protect express - need reverse proxy
//server.listen(3000, 'localhost', () => console.log('running at 3000'));

server.listen(3000, () => log('running at 3000'));

require('./watchme');