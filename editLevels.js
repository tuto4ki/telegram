import fs from 'fs';
import path from 'path';
import { EOL } from 'os';
import { access } from 'fs/promises';
import * as constants from 'node:constants';

function replaceTask (levels, task, regExp, collectType) {
	const map = levels.map;
	let task1;
	let isChanged = false;
	for (let i = 0; i < task.length; i++) {
		if (task[i].type === 'CollectType' && task[i].cell && task[i].cell.search(regExp) === 0) {
			isChanged = true;

			let amount = +task[i].amount;
			if (amount === 0) {
				// console.log('Task char', task[i].cell, levels.candyContent);
				// подсчет фишек на карте
				for (let k = 0; k < map.length; k++) {
					for (let s = 0; s < map[k].length; s++) {
						if (map[k][s] === task[i].cell) {
							amount++;
						}
					}
				}
				if (levels.candyContent === task[i].cell) {
					for (let k = 0; k < map.length; k++) {
						for (let s = 0; s < map[k].length; s++) {
							if (map[k][s] === ';') {
								amount++;
							}
						}
					}
					// console.log('candyContent', levels.candyContent, amount);
					levels.candyContent = collectType;
				}
			}
			if (task1) {
				task1.amount = Number(task1.amount) + amount;
				task.splice(i, 1);
				i--;
			} else {
				task1 = task[i];
				task1.amount = amount;
				task1.cell = collectType;
			}
		}
	}
	if (task1) {
		task1.amount = task1.amount.toString();
		if (task1.amount === 'NaN') {
			task1.amount = 'auto';
		}
	}
	return isChanged;
}

export async function editFileLevel (directory) {
	// console.log(directory);
	try {
		const fileName = path.join(directory, 'levels.json');
		await access(fileName, constants.F_OK);

		const file = fs.readFileSync(fileName, 'utf-8');
		let levels = JSON.parse(file);
		let isChanged = false;
		for (let number in levels) {
			let map = levels[number].map;
			isChanged = replaceTask(levels[number], levels[number].task, /[hjg]/g, 'g') || isChanged;
			isChanged = replaceTask(levels[number], levels[number].task, /[lbk]/g, 'k') || isChanged;
			isChanged = replaceTask(levels[number], levels[number].task, /[cun]/g, 'n') || isChanged;
			for (let i = 0; i < map.length; i++) {
				isChanged = isChanged ||
					(map[i].search(/[hj]/g, 'g') !== -1) ||
					(map[i].search(/[lb]/g, 'k') !== -1) ||
					(map[i].search(/[cu]/g, 'n') !== -1);

				map[i] = map[i].replaceAll(/[hj]/g, 'g');
				map[i] = map[i].replaceAll(/[lb]/g, 'k');
				map[i] = map[i].replaceAll(/[cu]/g, 'n');
			}
		}

		if (isChanged) {
			let str = `{`;
			if (levels.bonus) {
				str += `${EOL} "bonus": ${JSON.stringify(levels.bonus)},`
				delete levels.bonus;
			}
			for (let key in levels) {
				str += `${EOL} "${key}": ${JSON.stringify(levels[key])},`;
			}

			str = str.slice(0, -1) + `${EOL}}${EOL}`;

			fs.writeFileSync(path.join(
				directory,
				'levels.json'
			), str, 'utf-8');
		}

	} catch (err) {
		console.log(directory, err)
	}
}

// editFileLevel(path.join(
// 	process.cwd(),
// 	'../tapclap/GemsCocos/gems/res/levels/episode133'
// ))