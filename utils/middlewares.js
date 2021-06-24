import { compareSync } from 'bcrypt';
import serveIndex from 'serve-index';
import serveStatic from 'serve-static';

export function basicAuth(users) {
	return function (req, res, next) {

		// parse login and password from headers
		const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
		const [user, password] = Buffer.from(b64auth, 'base64').toString().split(':');

		if (user && password && users[user] && compareSync(password, users[user].password)) {
			req.user = user; // make authenticated user available to further routes
			return next();
		}

		// Access denied...
		res.set('WWW-Authenticate', 'Basic realm="Auth@Brupcorp"');
		res.status(401).send('Authentication required.');

	};
}
export function serveDir(path, options = { icons: true }) {
	return (req, res, next) => serveStatic(path)(req, res, () => serveIndex(path, options)(req, res, next));
}

import cheerio from 'cheerio';
import { build } from 'esbuild';
import { readFileSync } from 'fs';
import mime from 'mime';
import path from 'path';
import Stream from 'stream';
import { mkLog } from './util';
import chalk from 'chalk';
import { nanoid } from './nanoid';

export function compose({ entry = './index.html', prod = false, preact = false}){

	const doc = cheerio.load(readFileSync(entry));
	const mainJS = path.join(path.dirname(entry), doc('#entry').attr('src'));

	const srcLoc = './' + path.normalize(path.relative(process.cwd(), path.dirname(path.resolve(mainJS)))).replace(/\\/g, '/'); // holy fuck

	const bundleLog = mkLog('bundler', chalk.cyanBright, [srcLoc]);

	const outdir = nanoid(10);

	const buildConfig = {
		entryPoints: [mainJS],
		bundle: true,
		outdir,
		write: false,
		loader: {
			'.png': 'file'
		}
	}

	let bundled;

	function updateFiles(files, outdir){
		bundled = [];
		for(const f of files){
			f.path = f.path.substring(f.path.lastIndexOf(outdir) + outdir.length + 1);
			bundled.push(f);
		}
	}
	
	function hasFile(name){
		for(const f of bundled){
			if(f.path == name) return f;
		}
	}

	mainJS.endsWith('.js') && (buildConfig.loader['.js'] ='jsx');

	if(prod) buildConfig.minify = true;
	else {
		buildConfig.sourcemap = 'inline';
		buildConfig.watch = {};
		buildConfig.watch.onRebuild = function(error, result){
			if (error) bundleLog('watch build failed:', error)
			else {
				bundleLog('rebundle done')
				updateFiles(result.outputFiles, outdir);
			}
		}
	}

	if(preact){
		buildConfig.jsxFactory = 'h';
		buildConfig.jsxFragment = 'Fragment';
	}

	bundleLog('begin bundle...')
	build(buildConfig).then(result => {
		bundleLog('bundle done!')
		updateFiles(result.outputFiles, outdir);
	}).catch();

	return function(req, res){
		if(!req.originalUrl.replace(req.baseUrl, '')) return res.redirect(req.originalUrl + '/');
		const lastPartUrl = req.path.substr(req.path.lastIndexOf('/') + 1);

		if (lastPartUrl !== '' && hasFile(lastPartUrl)) {
			const stream = new Stream.PassThrough();
			stream.end(hasFile(lastPartUrl).contents);
			res.set('Content-Type', mime.getType(lastPartUrl));
			stream.pipe(res);
		} else {
			res.send(doc.html());
		}

	}
}