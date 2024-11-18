import { readdir, stat } from 'fs/promises';
import path from 'path';
import {editFileLevel} from './editLevels.js';

export const TYPE_FILE = {
	unknown: 'unknown',
	directory: 'directory',
	file: 'file',
};

const list = async () => {
	const dirName =  path.join(
		process.cwd(),
		// '../tapclap/GemsCocos/gems/res/levels'
		'../tapclap/gems/gems/lib/levels'
	);

	const files = await readdir(dirName);

	const arr = [];
	for (let file of files) {
		let statFile = await stat(path.join(dirName, file));
		let type = TYPE_FILE.unknown;

		if (statFile.isDirectory()) {
			type = TYPE_FILE.directory;
			await editFileLevel(path.join(dirName, file));
		}

	}
};

await list();
