const spawn = require('child_process').spawn;
const chalk = require('chalk');
const fs = require('fs');

var newArgs = [...process.argv];
newArgs.shift();
newArgs.shift();

const log = (...x) => console.log(chalk.blueBright('[watchdoggo]'), ...x);

if(!newArgs[0]){
	log('usage: watchdoggo <file> [--esm] <args>');
	return;
}

var entryPoint = newArgs[0];

if(newArgs[0] === '--esm'){
	if(!newArgs[1]){
		log('usage: watchdoggo <file> [--esm] <args>');
		return;
	}
	newArgs.shift();
	entryPoint = newArgs[0];
	newArgs = ['-r', 'esm', ...newArgs];
}

log(`watching ${entryPoint}!`);
console.log();

function runWatchdoggo(){

	var depTree = [];

	var watched = spawn(process.argv[0], newArgs, {
		cwd: process.cwd(),
		stdio: ['inherit', 'inherit', 'inherit', 'ipc']
	})
	
	function restartProc(file){
		console.log();
		log(`changes detected in ${chalk.yellow(require('path').basename(file))}! reloading...`);
		console.log();
		for(const file of depTree) fs.unwatchFile(file);
		
		watched.kill('SIGKILL');
		runWatchdoggo();
	}
	
	watched.on("message", m => {
		depTree = m.depTree;
		console.log();
		log('ready! waiting for changes...');
		console.log();

		for(const file of depTree) fs.watchFile(file, { interval: 1000 }, () => restartProc(file));

	})

}

runWatchdoggo();