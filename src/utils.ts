/* eslint-disable prefer-const */
/* eslint-disable no-prototype-builtins */
import fs from 'fs';
import cp from 'child_process';
import chalk from 'chalk';
import cpt from 'crypto';
import iconv from 'iconv-lite';
import {Cmp, Status} from './enum';
import {BuildStatus, Interface} from './class';
import {DIR_TASKS, DIR_WORKSHOP} from './const';
import {args} from './index';

function log(text: string) {
	// 增加字符串类型判断
	if (typeof text !== 'string') {
		console.log(chalk.yellow('Warning ') + 'Illegal type detected');
		console.log(JSON.stringify(text));
		return;
	}

	const spl = text.split(':');
	if (spl.length < 2) {
		console.log(chalk.yellow('Warning ') + 'Illegal message detected');
		console.log(text);
		return;
	}

	const inf = text.substring(spl[0].length + 1);
	switch (spl[0]) {
		case 'Info':
			if (args.hasOwnProperty('g')) {
				console.log(chalk.blue('Info: ') + inf);
			} else {
				console.log(chalk.blue('Info ') + inf);
			}

			break;
		case 'Success':
			if (args.hasOwnProperty('g')) {
				console.log(chalk.greenBright('Success: ') + inf);
			} else {
				console.log(chalk.greenBright('Success ') + inf);
			}

			break;
		case 'Warning':
			if (args.hasOwnProperty('g')) {
				console.log('::warning::' + inf);
			} else {
				console.log(chalk.yellow('Warning ') + inf);
			}

			break;
		case 'Error':
			if (args.hasOwnProperty('g')) {
				console.log('::error::' + inf);
			} else {
				console.log(chalk.red('Error ') + inf);
			}

			break;
		default:
			if (args.hasOwnProperty('g')) {
				console.log('::warning::Illegal message detected:' + inf);
			} else {
				console.log(chalk.yellow('Warning ') + 'Illegal message detected');
				console.log(text);
			}
	}
}

async function getMD5(filePath: string): Promise<string> {
	return new Promise(resolve => {
		const rs = fs.createReadStream(filePath);
		const hash = cpt.createHash('md5');
		let hex;
		rs.on('data', hash.update.bind(hash));
		rs.on('end', () => {
			hex = hash.digest('hex');
			log('Info:MD5 is ' + hex);
			resolve(hex);
		});
	});
}

function parseDownloadUrl(href: string): string {
	// 识别根目录字符“/”
	if (href[0] === '/') {
		href = 'https://portableapps.com' + href;
	}

	// 识别downloading，替换为redirect
	href = href.replace('downloading', 'redirect');

	// URL编码
	href = encodeURI(href);

	// Log("Info:Parse download link into:" + href)
	return href;
}

function formatVersion(version: string): string {
	const spl = version.split('.');
	if (spl.length > 4) {
		log('Warning:Illegal version "' + version + ',"length=' + spl.length);
		return version;
	}

	// 将版本号扩充为4位
	for (let i = 0; i < 4 - spl.length; i++) {
		version += '.0';
	}

	return version;
}

function matchVersion(text: string): Interface {
	const regex = /\d+.\d+(.\d+)*/;
	const matchRes = text.match(regex);
	if (!matchRes || matchRes.length === 0) {
		return new Interface({
			status: Status.ERROR,
			payload:
                'Error:Matched nothing when looking into "'
                + text
                + '" with "'
                + regex
                + '",skipping...',
		});
	}

	return new Interface({
		status: Status.SUCCESS,
		payload: matchRes[0],
	});
} // Interface:string

function versionCmp(a: string, b: string): Cmp {
	const x = a.split('.');
	const y = b.split('.');
	let result: Cmp = Cmp.E;

	for (let i = 0; i < Math.min(x.length, y.length); i++) {
		if (Number(x[i]) < Number(y[i])) {
			result = Cmp.L;
			break;
		} else if (Number(x[i]) > Number(y[i])) {
			result = Cmp.G;
			break;
		}
	}

	// 处理前几位版本号相同但是位数不一致的情况，如1.3/1.3.0
	if (result === Cmp.E && x.length !== y.length) {
		// 找出较长的那一个
		let t: Array<string>;
		t = x.length < y.length ? y : x;
		// 读取剩余位
		for (
			let i = Math.min(x.length, y.length);
			i < Math.max(x.length, y.length);
			i++
		) {
			if (Number(t[i]) !== 0) {
				result = x.length < y.length ? Cmp.L : Cmp.G;
				break;
			}
		}
	}

	return result;
}

function rd(dst: string): boolean {
	if (fs.existsSync(dst)) {
		try {
			dst = dst.replace(/\//g, '\\');
			cp.execSync('del /f /s /q "' + dst + '"');
			cp.execSync('rd /s /q "' + dst + '"');
		} catch (err: any) {
			console.log(err.output.toString());
			log('Warning:Can\'t remove directory ' + dst);
		}
	}

	return !fs.existsSync(dst);
}

function mv(src: string, dst: string): boolean {
	src = src.replace(/\//g, '\\');
	dst = dst.replace(/\//g, '\\');
	try {
		cp.execSync('move /y "' + src + '" "' + dst + '"');
	} catch (err: any) {
		console.log(err.output.toString());
		log('Error:Can\'t move ' + src + ' to ' + dst);
		return false;
	}

	return fs.existsSync(dst);
}

function xcopy(src: string, dst: string): boolean {
	// Demo:xcopy /s /r /y .\Edgeless %PA_Part%:\Edgeless\

	src = src.replace(/\//g, '\\');
	dst = dst.replace(/\//g, '\\');
	try {
		cp.execSync('xcopy /s /r /y "' + src + '" "' + dst + '"');
	} catch (err: any) {
		console.log(err.output.toString());
		log('Error:Can\'t copy ' + src + ' to ' + dst);
		return false;
	}

	return fs.existsSync(dst);
}

function cleanBuildStatus(s: Array<BuildStatus>): Array<BuildStatus> {
	// 按照时间降序排列
	s.sort((a, b) => b.time - a.time);

	return s.slice(0, 2);
}

function gbk(buffer: Buffer): string {
	return iconv.decode(buffer, 'GBK');
}

function toGbk(text:string):Buffer {
	return iconv.encode(text,'GBK');
}

function copyCover(name: string): boolean {
	if (fs.existsSync(DIR_TASKS + '/' + name + '/cover')) {
		if (!xcopy(DIR_TASKS + '/' + name + '/cover', DIR_WORKSHOP + '/' + name + '/release/')) {
			return false;
		}
	}

	return true;
}

export {
	log,
	getMD5,
	parseDownloadUrl,
	formatVersion,
	matchVersion,
	versionCmp,
	rd,
	mv,
	xcopy,
	cleanBuildStatus,
	gbk,
	toGbk,
	copyCover,
};
