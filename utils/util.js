import { existsSync, mkdirSync } from 'fs';

export function mkDirIfNotExist(path) {
	(!existsSync(path)) && mkdirSync(path, { 'recursive': true });
}

function mkPrefixString(strArr){
	var fin = '';
	for(const s of strArr) fin += `[${s}]`;
	return fin;
}

export function mkLog(prefix, color, customPrefix = []){
	return (...x) => console.log(color(`[${prefix}]${mkPrefixString(customPrefix)}:`), ...x);
}